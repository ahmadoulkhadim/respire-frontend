# API Endpoints Summary

## Authentication (No Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login & get JWT token |
| POST | `/api/auth/logout` | Logout |

## Users (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/{id}` | Get user details |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user (soft delete) |

## Profiles (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/{id}/profil` | Get user profile |
| PUT | `/api/users/{id}/profil` | Update profile |

## Cohortes/Groups (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cohortes` | List all cohortes |
| POST | `/api/cohortes` | Create cohorte |
| GET | `/api/cohortes/{id}` | Get cohorte details |
| PUT | `/api/cohortes/{id}` | Update cohorte |
| GET | `/api/cohortes/{id}/membres` | List members |
| POST | `/api/cohortes/{id}/membres/{user_id}` | Add member |
| DELETE | `/api/cohortes/{id}/membres/{user_id}` | Remove member |

## Sensors (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/capteurs` | List user's sensors |
| POST | `/api/capteurs` | Register new sensor |
| GET | `/api/capteurs/{id}` | Get sensor details |
| PUT | `/api/capteurs/{id}` | Update sensor |
| DELETE | `/api/capteurs/{id}` | Delete sensor |
| GET | `/api/capteurs/{id}/status` | Get real-time status |

## Sensor Data/Measurements (Mostly Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/data` | Send measurement (IoT device) |
| GET | `/api/capteurs/{id}/data` | Get history (7 days default) |
| GET | `/api/capteurs/{id}/data/latest` | Get latest value |
| GET | `/api/capteurs/{id}/data/aggregate` | Get stats (avg, min, max) |

## Utility
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API status |
| GET | `/health` | Health check |

---

## Request/Response Examples

### Register User
**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 1
}
```

### Login User
**Request:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 1
}
```

### Register Sensor
**Request:**
```bash
POST /api/capteurs
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Bedroom O2 Monitor",
  "type": "oxygen",
  "location": "Bedroom",
  "user_id": 1
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Bedroom O2 Monitor",
  "type": "oxygen",
  "location": "Bedroom",
  "user_id": 1,
  "is_active": true,
  "battery_level": null,
  "last_reading": null,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

### Send Measurement
**Request:**
```bash
POST /api/data
Content-Type: application/json

{
  "capteur_id": 1,
  "value": 98.5,
  "unit": "%"
}
```

**Response (200 OK):**
```json
{
  "message": "Data point recorded",
  "timestamp": "2024-01-15T10:30:30"
}
```

### Get Latest Measurement
**Request:**
```bash
GET /api/capteurs/1/data/latest
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "capteur_id": 1,
  "capteur_name": "Bedroom O2 Monitor",
  "timestamp": "2024-01-15T10:30:30",
  "value": 98.5,
  "unit": "%"
}
```

### Get Aggregated Data
**Request:**
```bash
GET /api/capteurs/1/data/aggregate?period=24h
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "capteur_id": 1,
  "capteur_name": "Bedroom O2 Monitor",
  "period": "24h",
  "average": 97.8,
  "min": 95.2,
  "max": 99.5,
  "count": 1440
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Email already registered"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "detail": "You can only update your own profile"
}
```

### 404 Not Found
```json
{
  "detail": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Error querying data: connection failed"
}
```
