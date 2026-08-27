from sqlalchemy import Column, Integer, String, Boolean, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy import DateTime
import enum
from app.db.base_class import Base

class ExerciseType(enum.Enum):
    WEIGHT_BASED = "WEIGHT_BASED"
    TIME_BASED = "TIME_BASED"

class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    exercise_type = Column(Enum(ExerciseType), nullable=False)
    muscle_group = Column(String, nullable=True)
    equipment = Column(String, nullable=True)
    instructions = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())