"""Profil routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.profil import Profil
from app.models.user import User
from app.schemas import ProfilResponse, ProfilCreate, ProfilUpdate
from app.auth import get_current_user

router = APIRouter()


@router.get("/{user_id}/profil", response_model=ProfilResponse)
async def get_profil(user_id: int, db: Session = Depends(get_db)):
    """Get user profile"""
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    profil = db.query(Profil).filter(Profil.user_id == user_id).first()
    if not profil:
        # Create default profil if not exists
        profil = Profil(user_id=user_id)
        db.add(profil)
        db.commit()
        db.refresh(profil)

    return profil


@router.put("/{user_id}/profil", response_model=ProfilResponse)
async def update_profil(
    user_id: int,
    profil_data: ProfilUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """Update user profile"""
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    profil = db.query(Profil).filter(Profil.user_id == user_id).first()
    if not profil:
        # Create profil if doesn't exist
        profil = Profil(user_id=user_id)
        db.add(profil)
        db.commit()
        db.refresh(profil)

    # Update fields
    if profil_data.bio is not None:
        profil.bio = profil_data.bio
    if profil_data.avatar_url is not None:
        profil.avatar_url = profil_data.avatar_url

    db.commit()
    db.refresh(profil)
    return profil
