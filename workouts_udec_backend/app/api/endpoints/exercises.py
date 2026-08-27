from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import dependencies
from app.crud.crud_exercise import exercise
from app.models.user import User
from app.schemas.exercise import Exercise as ExerciseSchema, ExerciseCreate, ExerciseUpdate

router = APIRouter()

@router.get("/", response_model=List[ExerciseSchema])
def read_exercises(
    db: Session = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(dependencies.get_current_active_user),
) -> Any:
    exercises = exercise.get_active(db, skip=skip, limit=limit)
    return exercises

@router.get("/{exercise_id}", response_model=ExerciseSchema)
def read_exercise(
    *,
    db: Session = Depends(dependencies.get_db),
    exercise_id: int,
    current_user: User = Depends(dependencies.get_current_active_user),
) -> Any:
    exercise_obj = exercise.get(db, id=exercise_id)
    if not exercise_obj:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise_obj

@router.post("/", response_model=ExerciseSchema)
def create_exercise(
    *,
    db: Session = Depends(dependencies.get_db),
    exercise_in: ExerciseCreate,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    exercise_obj = exercise.create(db, obj_in=exercise_in)
    return exercise_obj

@router.put("/{exercise_id}", response_model=ExerciseSchema)
def update_exercise(
    *,
    db: Session = Depends(dependencies.get_db),
    exercise_id: int,
    exercise_in: ExerciseUpdate,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    exercise_obj = exercise.get(db, id=exercise_id)
    if not exercise_obj:
        raise HTTPException(status_code=404, detail="Exercise not found")
    exercise_obj = exercise.update(db, db_obj=exercise_obj, obj_in=exercise_in)
    return exercise_obj

@router.delete("/{exercise_id}")
def delete_exercise(
    *,
    db: Session = Depends(dependencies.get_db),
    exercise_id: int,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    exercise_obj = exercise.get(db, id=exercise_id)
    if not exercise_obj:
        raise HTTPException(status_code=404, detail="Exercise not found")
    exercise.remove(db, id=exercise_id)
    return {"message": "Exercise deleted successfully"}