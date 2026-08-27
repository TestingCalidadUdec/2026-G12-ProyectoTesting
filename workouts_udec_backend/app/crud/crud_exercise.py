from typing import List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate

class CRUDExercise(CRUDBase[Exercise, ExerciseCreate, ExerciseUpdate]):
    def get_active(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Exercise]:
        return db.query(Exercise).filter(Exercise.is_active == True).offset(skip).limit(limit).all()

    def get_by_muscle_group(self, db: Session, *, muscle_group: str) -> List[Exercise]:
        return db.query(Exercise).filter(
            Exercise.muscle_group == muscle_group,
            Exercise.is_active == True
        ).all()

exercise = CRUDExercise(Exercise)