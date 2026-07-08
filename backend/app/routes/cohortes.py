"""Cohorte routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.cohorte import Cohorte, CohorteUser
from app.models.user import User
from app.schemas import CohorteResponse, CohorteCreate, CohorteUpdate, CohorteMembersResponse, UserResponse
from app.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[CohorteResponse])
async def list_cohortes(db: Session = Depends(get_db)):
    """List all cohortes"""
    cohortes = db.query(Cohorte).all()
    return cohortes


@router.post("/", response_model=CohorteResponse)
async def create_cohorte(
    cohorte_data: CohorteCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """Create a new cohorte"""
    # Check if cohorte already exists
    existing = db.query(Cohorte).filter(Cohorte.name == cohorte_data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cohorte already exists",
        )

    new_cohorte = Cohorte(
        name=cohorte_data.name,
        description=cohorte_data.description,
    )
    db.add(new_cohorte)
    db.commit()
    db.refresh(new_cohorte)
    return new_cohorte


@router.get("/{cohorte_id}", response_model=CohorteResponse)
async def get_cohorte(cohorte_id: int, db: Session = Depends(get_db)):
    """Get cohorte details"""
    cohorte = db.query(Cohorte).filter(Cohorte.id == cohorte_id).first()
    if not cohorte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cohorte not found",
        )
    return cohorte


@router.put("/{cohorte_id}", response_model=CohorteResponse)
async def update_cohorte(
    cohorte_id: int,
    cohorte_data: CohorteUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """Update cohorte"""
    cohorte = db.query(Cohorte).filter(Cohorte.id == cohorte_id).first()
    if not cohorte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cohorte not found",
        )

    if cohorte_data.name:
        existing = db.query(Cohorte).filter(Cohorte.name == cohorte_data.name, Cohorte.id != cohorte_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name already in use",
            )
        cohorte.name = cohorte_data.name

    if cohorte_data.description is not None:
        cohorte.description = cohorte_data.description

    db.commit()
    db.refresh(cohorte)
    return cohorte


@router.get("/{cohorte_id}/membres", response_model=CohorteMembersResponse)
async def get_cohorte_members(cohorte_id: int, db: Session = Depends(get_db)):
    """Get members of a cohorte"""
    cohorte = db.query(Cohorte).filter(Cohorte.id == cohorte_id).first()
    if not cohorte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cohorte not found",
        )

    # Get all users in this cohorte
    members = db.query(User).join(
        CohorteUser, User.id == CohorteUser.user_id
    ).filter(CohorteUser.cohorte_id == cohorte_id, User.is_active == True).all()

    return {
        "id": cohorte.id,
        "name": cohorte.name,
        "members": members,
        "created_at": cohorte.created_at,
    }


@router.post("/{cohorte_id}/membres/{user_id}")
async def add_member_to_cohorte(
    cohorte_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """Add a member to a cohorte"""
    cohorte = db.query(Cohorte).filter(Cohorte.id == cohorte_id).first()
    if not cohorte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cohorte not found",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Check if user already in cohorte
    existing = db.query(CohorteUser).filter(
        CohorteUser.cohorte_id == cohorte_id,
        CohorteUser.user_id == user_id,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already in cohorte",
        )

    cohorte_user = CohorteUser(cohorte_id=cohorte_id, user_id=user_id)
    db.add(cohorte_user)
    db.commit()

    return {"message": "User added to cohorte"}


@router.delete("/{cohorte_id}/membres/{user_id}")
async def remove_member_from_cohorte(
    cohorte_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    """Remove a member from a cohorte"""
    cohorte_user = db.query(CohorteUser).filter(
        CohorteUser.cohorte_id == cohorte_id,
        CohorteUser.user_id == user_id,
    ).first()

    if not cohorte_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not in this cohorte",
        )

    db.delete(cohorte_user)
    db.commit()

    return {"message": "User removed from cohorte"}
