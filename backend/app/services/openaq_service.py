"""Service for fetching air quality data from OpenAQ API"""
import httpx
from typing import Dict, Any, Optional, List

OPENAQ_BASE_URL = "https://api.openaq.org/v3"
OPENAQ_API_KEY = "7edbe9d84a4db878050e3c897def06ade3933d42a01ab9b9a75b5352cc1127ac"

STATIONS: Dict[int, Dict[str, Any]] = {
    3431595: {
        "name": "Lycée de Bargny, Rufisque",
        "latitude": 14.6931,
        "longitude": -17.2300,
    },
    6134928: {
        "name": "Université Amadou Mahtar Mbow (UAM)",
        "latitude": 14.7850,
        "longitude": -17.4500,
    },
}

POSITION_PARAM_MAP = [
    ("pm1", "PM1", "µg/m³"),
    ("pm25", "PM2.5", "µg/m³"),
    ("relativehumidity", "RH", "%"),
    ("temperature", "Température", "°C"),
    ("um003", "PM0.3 count", "particles/cm³"),
]


async def get_sensor_metadata(location_id: int) -> Dict[int, Dict[str, str]]:
    url = f"{OPENAQ_BASE_URL}/locations/{location_id}"
    headers = {"X-API-Key": OPENAQ_API_KEY}
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        except Exception:
            return {}

    meta: Dict[int, Dict[str, str]] = {}
    results = data.get("results", [])
    if not results:
        return meta
    sensors = results[0].get("sensors", [])
    for s in sensors:
        sid = s.get("id")
        name = s.get("name", "unknown")
        param_field = s.get("parameter", {})
        if isinstance(param_field, dict):
            parameter = param_field.get("name", name).lower()
            units = param_field.get("units", "unknown")
            display_name = param_field.get("displayName", name)
        else:
            parameter = (param_field or name).lower()
            units = "unknown"
            display_name = name
        if sid:
            meta[sid] = {
                "name": display_name,
                "parameter": parameter,
                "units": units,
            }
    return meta


async def fetch_station_data(location_id: int) -> Optional[Dict[str, Any]]:
    url = f"{OPENAQ_BASE_URL}/locations/{location_id}/latest"
    headers = {"X-API-Key": OPENAQ_API_KEY}
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            raw = resp.json()
        except Exception:
            return None

    sensors_meta = await get_sensor_metadata(location_id)
    results = raw.get("results", [])
    if not results:
        return None

    info = STATIONS.get(location_id, {})
    out: Dict[str, Any] = {
        "location_id": location_id,
        "station_name": info.get("name", f"Station {location_id}"),
        "latitude": info.get("latitude"),
        "longitude": info.get("longitude"),
        "timestamp": None,
        "measurements": {},
    }

    for i, entry in enumerate(results):
        sid = entry.get("sensorsId")
        value = entry.get("value")
        dt = entry.get("datetime") or {}
        ts = dt.get("utc") if isinstance(dt, dict) else None

        if out["timestamp"] is None and ts:
            out["timestamp"] = ts

        param_key = unit = display_name = None

        if sid and sid in sensors_meta:
            meta = sensors_meta[sid]
            param_key = meta["parameter"]
            display_name = meta["name"]
            unit = meta.get("units", "unknown")
        elif i < len(POSITION_PARAM_MAP):
            param_key = POSITION_PARAM_MAP[i][0]
            display_name = POSITION_PARAM_MAP[i][1]
            unit = POSITION_PARAM_MAP[i][2]

        if param_key and value is not None:
            out["measurements"][param_key] = {
                "value": float(value),
                "unit": unit or "unknown",
                "display_name": display_name or param_key,
                "sensors_id": sid,
            }

    return out


async def fetch_all_stations() -> List[Dict[str, Any]]:
    import asyncio
    tasks = [fetch_station_data(lid) for lid in STATIONS]
    results = await asyncio.gather(*tasks)
    return [r for r in results if r is not None]
