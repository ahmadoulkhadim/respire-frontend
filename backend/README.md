# Respire API - Backend Documentation

## Overview
Respire is an IoT backend API for respiratory health monitoring built with FastAPI, MySQL, and InfluxDB.

## Tech Stack
- **Framework**: FastAPI (Python)
- **Database**: MySQL (relational data)
- **Time-Series DB**: InfluxDB (sensor measurements)
- **Authentication**: JWT Token

## Setup

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
Update `.env` with your credentials:
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=respire_db

INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=your_token
INFLUX_ORG=your_org
INFLUX_BUCKET=respire_data

SECRET_KEY=your-super-secret-key
```

### 4. Run Server
```bash
python -m uvicorn app.main:app --reload
```

Server runs at `http://localhost:8000`

## API Endpoints

### Authentication
```
POST   /api/auth/register        Create a new account
POST   /api/auth/login           Login & get JWT token
POST   /api/auth/logout          Logout
```

### Users
```
GET    /api/users                List all users
GET    /api/users/{id}           Get user details
PUT    /api/users/{id}           Update user
DELETE /api/users/{id}           Delete user
```

### Profiles
```
GET    /api/users/{id}/profil         Get user profile
PUT    /api/users/{id}/profil         Update profile
```

### Cohortes (Groups)
```
GET    /api/cohortes                  List all cohortes
POST   /api/cohortes                  Create cohorte
GET    /api/cohortes/{id}             Get cohorte details
PUT    /api/cohortes/{id}             Update cohorte
GET    /api/cohortes/{id}/membres     List members
POST   /api/cohortes/{id}/membres/{user_id}   Add member
DELETE /api/cohortes/{id}/membres/{user_id}   Remove member
```

### Sensors
```
GET    /api/capteurs                           List user's sensors
POST   /api/capteurs                           Register new sensor
GET    /api/capteurs/{id}                      Get sensor details
PUT    /api/capteurs/{id}                      Update sensor
DELETE /api/capteurs/{id}                      Delete sensor
GET    /api/capteurs/{id}/status              Get real-time status
```

### Data (Measurements)
```
POST   /api/data                               Send measurement
GET    /api/capteurs/{id}/data                 Get history (7 days)
GET    /api/capteurs/{id}/data/latest          Get latest value
GET    /api/capteurs/{id}/data/aggregate       Get stats (avg, min, max)
```

## Database Schema

### MySQL Tables

#### users
```sql
- id (INT, PK)
- email (VARCHAR, UNIQUE)
- hashed_password (VARCHAR)
- first_name (VARCHAR)
- last_name (VARCHAR)
- is_active (BOOLEAN)
- created_at (DATETIME)
- updated_at (DATETIME)
```

#### profils
```sql
- id (INT, PK)
- user_id (INT, FK)
- bio (TEXT)
- avatar_url (VARCHAR)
- created_at (DATETIME)
- updated_at (DATETIME)
```

#### cohortes
```sql
- id (INT, PK)
- name (VARCHAR, UNIQUE)
- description (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
```

#### cohorte_users
```sql
- id (INT, PK)
- cohorte_id (INT, FK)
- user_id (INT, FK)
- added_at (DATETIME)
```

#### capteurs
```sql
- id (INT, PK)
- name (VARCHAR)
- type (VARCHAR)
- location (VARCHAR)
- user_id (INT, FK)
- is_active (BOOLEAN)
- battery_level (FLOAT)
- last_reading (DATETIME)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### InfluxDB Measurement

#### sensor_measurement
```
Tags: capteur_id, capteur_name, type, user_id
Fields: value, unit
Timestamp: datetime
```

## Example Requests

### Register User
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

### Register Sensor
```bash
curl -X POST "http://localhost:8000/api/capteurs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bedroom Oxygen Monitor",
    "type": "oxygen",
    "location": "Bedroom",
    "user_id": 1
  }'
```

### Send Measurement
```bash
curl -X POST "http://localhost:8000/api/data" \
  -H "Content-Type: application/json" \
  -d '{
    "capteur_id": 1,
    "value": 98.5,
    "unit": "%"
  }'
```

### Get Latest Measurement
```bash
curl -X GET "http://localhost:8000/api/capteurs/1/data/latest" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication.

Include token in request header:
```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

API returns standard HTTP status codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Development

### Code Structure
```
backend/
├── app/
│   ├── main.py          # FastAPI application
│   ├── auth.py          # JWT utilities
│   ├── database.py      # MySQL connection
│   ├── influx.py        # InfluxDB connection
│   ├── schemas.py       # Pydantic models
│   ├── models/          # SQLAlchemy ORM models
│   └── routes/          # API endpoints
├── requirements.txt     # Dependencies
└── .env                 # Environment variables
```

### Creating Database
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE respire_db;
```

## Future Enhancements
- WebSocket support for real-time data
- Advanced analytics
- Multi-user permissions
- Data export functionality
- Alerts & notifications
