"""Data routes for sensor measurements"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from app.database import get_db
from app.models.capteur import Capteur
from app.schemas import DataPoint, DataHistoryResponse, DataLatestResponse, DataAggregateResponse, DataPointResponse
from app.auth import get_current_user
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# InfluxDB client setup
INFLUX_URL = os.getenv("INFLUX_URL", "http://localhost:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN", "")
INFLUX_ORG = os.getenv("INFLUX_ORG", "")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "respire_data")

influx_client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
write_api = influx_client.write_api(write_options=SYNCHRONOUS)
query_api = influx_client.query_api()


@router.post("/")
async def post_data(
    data: DataPoint,
    db: Session = Depends(get_db),
):
    """Send a measurement from a sensor"""
    # Verify sensor exists
    capteur = db.query(Capteur).filter(Capteur.id == data.capteur_id).first()
    if not capteur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found",
        )

    # Update sensor's last_reading timestamp
    capteur.last_reading = datetime.utcnow()
    db.commit()

    # Write to InfluxDB
    timestamp = data.timestamp or datetime.utcnow()
    point = Point("sensor_measurement")\
        .tag("capteur_id", str(data.capteur_id))\
        .tag("capteur_name", capteur.name)\
        .tag("type", capteur.type)\
        .tag("user_id", str(capteur.user_id))\
        .field("value", data.value)\
        .field("unit", data.unit)\
        .time(timestamp)

    write_api.write(bucket=INFLUX_BUCKET, record=point)

    return {"message": "Data point recorded", "timestamp": timestamp}


@router.get("/{capteur_id}/data", response_model=DataHistoryResponse)
async def get_sensor_history(
    capteur_id: int,
    days: int = 7,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """Get sensor measurement history"""
    capteur = db.query(Capteur).filter(
        Capteur.id == capteur_id,
        Capteur.user_id == current_user_id,
    ).first()

    if not capteur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found",
        )

    # Query from InfluxDB
    query = f'''
        from(bucket: "{INFLUX_BUCKET}")
        |> range(start: -{days}d)
        |> filter(fn: (r) => r["_measurement"] == "sensor_measurement")
        |> filter(fn: (r) => r["capteur_id"] == "{capteur_id}")
        |> sort(columns: ["_time"], desc: true)
    '''

    try:
        result = query_api.query(org=INFLUX_ORG, query=query)
        data_points = []

        for table in result:
            for record in table.records:
                data_points.append({
                    "timestamp": record.get_time(),
                    "value": record.get_value(),
                    "unit": record.values.get("unit", "unknown"),
                    "capteur_id": capteur_id,
                })

        return {
            "capteur_id": capteur_id,
            "capteur_name": capteur.name,
            "data": data_points,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying data: {str(e)}",
        )


@router.get("/{capteur_id}/data/latest", response_model=DataLatestResponse)
async def get_latest_data(
    capteur_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """Get latest sensor measurement"""
    capteur = db.query(Capteur).filter(
        Capteur.id == capteur_id,
        Capteur.user_id == current_user_id,
    ).first()

    if not capteur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found",
        )

    # Query latest value from InfluxDB
    query = f'''
        from(bucket: "{INFLUX_BUCKET}")
        |> range(start: -1h)
        |> filter(fn: (r) => r["_measurement"] == "sensor_measurement")
        |> filter(fn: (r) => r["capteur_id"] == "{capteur_id}")
        |> sort(columns: ["_time"], desc: true)
        |> limit(n: 1)
    '''

    try:
        result = query_api.query(org=INFLUX_ORG, query=query)

        if not result or len(result) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No data found for this sensor",
            )

        record = result[0].records[0]
        return {
            "capteur_id": capteur_id,
            "capteur_name": capteur.name,
            "timestamp": record.get_time(),
            "value": record.get_value(),
            "unit": record.values.get("unit", "unknown"),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying data: {str(e)}",
        )


@router.get("/{capteur_id}/data/aggregate", response_model=DataAggregateResponse)
async def get_aggregate_data(
    capteur_id: int,
    period: str = "1h",
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """Get aggregated data (average, min, max) over a period"""
    capteur = db.query(Capteur).filter(
        Capteur.id == capteur_id,
        Capteur.user_id == current_user_id,
    ).first()

    if not capteur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found",
        )

    # Query aggregates from InfluxDB
    query = f'''
        from(bucket: "{INFLUX_BUCKET}")
        |> range(start: -{period})
        |> filter(fn: (r) => r["_measurement"] == "sensor_measurement")
        |> filter(fn: (r) => r["capteur_id"] == "{capteur_id}")
        |> group(columns: ["capteur_id"])
        |> reduce(
            identity: {{avg: 0.0, min: 999999.0, max: -999999.0, count: 0}},
            fn: (r, acc) => ({{
                avg: acc.avg + r._value,
                min: if r._value < acc.min then r._value else acc.min,
                max: if r._value > acc.max then r._value else acc.max,
                count: acc.count + 1
            }})
        )
    '''

    try:
        result = query_api.query(org=INFLUX_ORG, query=query)

        if not result or len(result) == 0:
            return {
                "capteur_id": capteur_id,
                "capteur_name": capteur.name,
                "period": period,
                "average": None,
                "min": None,
                "max": None,
                "count": 0,
            }

        record = result[0].records[0] if result[0].records else None
        if record:
            values = record.values
            avg = values.get("avg", 0) / values.get("count", 1) if values.get("count", 0) > 0 else None
            return {
                "capteur_id": capteur_id,
                "capteur_name": capteur.name,
                "period": period,
                "average": avg,
                "min": values.get("min"),
                "max": values.get("max"),
                "count": values.get("count", 0),
            }
        else:
            return {
                "capteur_id": capteur_id,
                "capteur_name": capteur.name,
                "period": period,
                "average": None,
                "min": None,
                "max": None,
                "count": 0,
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying data: {str(e)}",
        )

