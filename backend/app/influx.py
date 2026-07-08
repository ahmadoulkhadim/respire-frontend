import os
from influxdb_client import InfluxDBClient
from dotenv import load_dotenv

load_dotenv()

# InfluxDB connection parameters
INFLUX_URL = os.getenv("INFLUX_URL", "http://localhost:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN")
INFLUX_ORG = os.getenv("INFLUX_ORG")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET")

# Create InfluxDB client
influx_client = InfluxDBClient(
    url=INFLUX_URL,
    token=INFLUX_TOKEN,
    org=INFLUX_ORG
)


def get_influx_client():
    return influx_client


def get_query_api():
    return influx_client.query_api()


def get_write_api():
    return influx_client.write_api(write_options=SYNCHRONOUS)
