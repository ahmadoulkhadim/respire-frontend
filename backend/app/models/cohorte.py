from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from datetime import datetime
from app.models import Base


class Cohorte(Base):
    __tablename__ = "cohortes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CohorteUser(Base):
    __tablename__ = "cohorte_users"

    id = Column(Integer, primary_key=True, index=True)
    cohorte_id = Column(Integer, ForeignKey("cohortes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)
