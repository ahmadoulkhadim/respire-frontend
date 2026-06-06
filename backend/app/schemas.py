"""Pydantic schemas for API requests/responses"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


# ============ AUTH SCHEMAS ============
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int


# ============ USER SCHEMAS ============
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ PROFIL SCHEMAS ============
class ProfilCreate(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfilUpdate(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfilResponse(BaseModel):
    id: int
    user_id: int
    bio: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ COHORTE SCHEMAS ============
class CohorteCreate(BaseModel):
    name: str
    description: Optional[str] = None


class CohorteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CohorteResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CohorteMembersResponse(BaseModel):
    id: int
    name: str
    members: List[UserResponse]
    created_at: datetime

    class Config:
        from_attributes = True


# ============ CAPTEUR SCHEMAS ============
class CapteurCreate(BaseModel):
    name: str
    type: str  # e.g., "temperature", "humidity", "oxygen"
    location: Optional[str] = None
    user_id: int


class CapteurUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None


class CapteurResponse(BaseModel):
    id: int
    name: str
    type: str
    location: Optional[str]
    user_id: int
    is_active: bool
    last_reading: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CapteurStatusResponse(BaseModel):
    id: int
    name: str
    is_active: bool
    battery_level: Optional[float] = None
    last_reading: Optional[datetime]
    last_value: Optional[float] = None
    status: str  # "online", "offline", "error"


# ============ DATA SCHEMAS ============
class DataPoint(BaseModel):
    capteur_id: int
    value: float
    unit: str = "unknown"
    timestamp: Optional[datetime] = None


class DataPointResponse(BaseModel):
    timestamp: datetime
    value: float
    unit: str
    capteur_id: int


class DataHistoryResponse(BaseModel):
    capteur_id: int
    capteur_name: str
    data: List[DataPointResponse]


class DataLatestResponse(BaseModel):
    capteur_id: int
    capteur_name: str
    timestamp: datetime
    value: float
    unit: str


class DataAggregateResponse(BaseModel):
    capteur_id: int
    capteur_name: str
    period: str
    average: Optional[float]
    min: Optional[float]
    max: Optional[float]
    count: int
