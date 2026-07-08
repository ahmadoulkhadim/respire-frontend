"""Sync routes – pull real data from OpenAQ into the platform."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database import get_db
from app.models.capteur import Capteur
from app.models.user import User
from app.services.openaq_service import fetch_all_stations
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

INFLUX_URL = os.getenv("INFLUX_URL", "http://localhost:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN", "")
INFLUX_ORG = os.getenv("INFLUX_ORG", "")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "respire_data")

influx_client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
write_api = influx_client.write_api(write_options=SYNCHRONOUS)


def _get_or_create_system_user(db: Session) -> User:
    user = db.query(User).filter(User.email == "openaq@respire.sn").first()
    if not user:
        user = User(
            email="openaq@respire.sn",
            hashed_password="[system]",
            first_name="OpenAQ",
            last_name="System",
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def _get_or_create_capteur(
    db: Session,
    user_id: int,
    station_name: str,
    location_str: str,
) -> Capteur:
    capteur = db.query(Capteur).filter(Capteur.name == station_name).first()
    if not capteur:
        capteur = Capteur(
            name=station_name,
            type="qualite_air",
            location=location_str,
            user_id=user_id,
            is_active=True,
        )
        db.add(capteur)
        db.commit()
        db.refresh(capteur)
    return capteur


@router.post("/openaq")
async def sync_openaq(db: Session = Depends(get_db)):
    """Pull live data from all OpenAQ stations and persist to InfluxDB."""
    system_user = _get_or_create_system_user(db)
    stations_data = await fetch_all_stations()

    if not stations_data:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="No data received from OpenAQ API",
        )

    summary = {
        "stations_synced": 0,
        "measurements_recorded": 0,
        "details": [],
    }

    for station in stations_data:
        name = station["station_name"]
        lat = station.get("latitude")
        lon = station.get("longitude")
        location_str = f"{name} ({lat}, {lon})" if lat and lon else name

        ts_raw = station.get("timestamp")
        try:
            ts = datetime.fromisoformat(ts_raw.replace("Z", "+00:00")) if ts_raw else datetime.now(timezone.utc)
        except Exception:
            ts = datetime.now(timezone.utc)

        capteur = _get_or_create_capteur(db, system_user.id, name, location_str)
        capteur.last_reading = ts
        db.commit()

        detail = {
            "station": name,
            "location_id": station["location_id"],
            "capteur_id": capteur.id,
            "parameters": [],
        }

        for param_key, meas in station["measurements"].items():
            point = Point("sensor_measurement")\
                .tag("capteur_id", str(capteur.id))\
                .tag("capteur_name", capteur.name)\
                .tag("type", capteur.type)\
                .tag("user_id", str(system_user.id))\
                .tag("source", "openaq")\
                .tag("location_id", str(station["location_id"]))\
                .tag("parameter", param_key)\
                .field("value", meas["value"])\
                .field("unit", meas["unit"])\
                .time(ts)

            write_api.write(bucket=INFLUX_BUCKET, record=point)

            detail["parameters"].append({
                "parameter": param_key,
                "value": meas["value"],
                "unit": meas["unit"],
            })
            summary["measurements_recorded"] += 1

        summary["stations_synced"] += 1
        summary["details"].append(detail)

    return {
        "message": "OpenAQ sync completed",
        "timestamp": datetime.utcnow().isoformat(),
        "summary": summary,
    }
