"""Database models"""
from sqlalchemy.orm import declarative_base

Base = declarative_base()

from app.models.user import User
from app.models.profil import Profil
from app.models.cohorte import Cohorte, CohorteUser
from app.models.capteur import Capteur
