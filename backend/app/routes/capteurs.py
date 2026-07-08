"""Sensor routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.capteur import Capteur
from app.models.user import User
from app.schemas import CapteurResponse, CapteurCreate, CapteurUpdate, CapteurStatusResponse
from app.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[CapteurResponse])
async def list_capteurs(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """List all sensors for current user"""
    capteurs = db.query(Capteur).filter(Capteur.user_id == current_user_id).all()
    return capteurs


@router.post("/", response_model=CapteurResponse)
async def create_capteur(
    capteur_data: CapteurCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """Register a new sensor"""
    if capteur_data.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only register sensors for your own account",
        )

    user = db.query(User).filter(User.id == capteur_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    new_capteur = Capteur(
        name=capteur_data.name,
        type=capteur_data.type,
        location=capteur_data.location,
        user_id=capteur_data.user_id,
    )
    db.add(new_capteur)
    db.commit()
    db.refresh(new_capteur)
    return new_capteur


@router.get("/{capteur_id}", response_model=CapteurResponse)
async def get_capteur(
    capteur_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """Get sensor details"""
    capteur = db.query(Capteur).filter(
        Capteur.id == capteur_id,
        Capteur.user_id == current_user_id,
    ).first()

    if not capteur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found",
        )
    return capteur


@router.put("/{capteur_id}", response_model=CapteurResponse)
async def update_capteur(
    capteur_id: int,
    capteur_data: CapteurUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """Update sensor"""
    capteur = db.query(Capteur).filter(
        Capteur.id == capteur_id,
        Capteur.user_id == current_user_id,
    ).first()

    if not capteur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found",
        )

    if capteur_data.name:
        capteur.name = capteur_data.name
    if capteur_data.location is not None:
        capteur.location = capteur_data.location
    if capteur_data.is_active is not None:
        capteur.is_active = capteur_data.is_active

    db.commit()
    db.refresh(capteur)
    return capteur


@router.delete("/{capteur_id}")
async def delete_capteur(
    capteur_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """Delete sensor"""
    capteur = db.query(Capteur).filter(
        Capteur.id == capteur_id,
        Capteur.user_id == current_user_id,
    ).first()

    if not capteur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found",
        )

    db.delete(capteur)
    db.commit()
    return {"message": "Sensor deleted"}


@router.get("/{capteur_id}/status", response_model=CapteurStatusResponse)
async def get_capteur_status(
    capteur_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """Get real-time sensor status"""
    capteur = db.query(Capteur).filter(
        Capteur.id == capteur_id,
        Capteur.user_id == current_user_id,
    ).first()

    if not capteur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found",
        )

    # Determine status based on last reading
    status = "online"
    if capteur.last_reading:
        time_diff = datetime.utcnow() - capteur.last_reading
        if time_diff.total_seconds() > 300:  # 5 minutes
            status = "offline"
    else:
        status = "offline"

    return {
        "id": capteur.id,
        "name": capteur.name,
        "is_active": capteur.is_active,
        "battery_level": capteur.battery_level,
        "last_reading": capteur.last_reading,
        "last_value": None,  # Will be populated from InfluxDB
        "status": status,
    }

