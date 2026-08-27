from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import dependencies
from app.crud.crud_user import user
from app.crud.crud_workout import workout_template
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate
from app.schemas.workout import (
    WorkoutTemplate as WorkoutTemplateSchema,
    WorkoutTemplateCreate,
    WorkoutTemplateUpdate,
    WorkoutTemplateExercise as WorkoutTemplateExerciseSchema,
    WorkoutTemplateExerciseCreate
)

router = APIRouter()

@router.get("/users", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    users = user.get_multi(db, skip=skip, limit=limit)
    return users

@router.post("/users", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(dependencies.get_db),
    user_in: UserCreate,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    user_obj = user.get_by_email(db, email=user_in.email)
    if user_obj:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user_obj = user.get_by_username(db, username=user_in.username)
    if user_obj:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user_obj = user.create(db, obj_in=user_in)
    return user_obj

@router.put("/users/{user_id}", response_model=UserSchema)
def update_user(
    *,
    db: Session = Depends(dependencies.get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    user_obj = user.get(db, id=user_id)
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    user_obj = user.update(db, db_obj=user_obj, obj_in=user_in)
    return user_obj

@router.delete("/users/{user_id}")
def delete_user(
    *,
    db: Session = Depends(dependencies.get_db),
    user_id: int,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    user_obj = user.get(db, id=user_id)
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.delete_with_cascade(db, user_id=user_id)
    return {"message": "User and all associated data deleted successfully"}

# Workout Template Management
@router.get("/workout-templates", response_model=List[WorkoutTemplateSchema])
def read_workout_templates(
    db: Session = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    templates = workout_template.get_multi_with_exercises(db, skip=skip, limit=limit)
    return templates

@router.get("/workout-templates/{template_id}", response_model=WorkoutTemplateSchema)
def read_workout_template(
    *,
    db: Session = Depends(dependencies.get_db),
    template_id: int,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    template = workout_template.get_with_exercises(db, id=template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Workout template not found")
    return template

@router.post("/workout-templates", response_model=WorkoutTemplateSchema)
def create_workout_template(
    *,
    db: Session = Depends(dependencies.get_db),
    template_in: WorkoutTemplateCreate,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    template_obj = workout_template.create(db, obj_in=template_in, created_by=current_user.id)
    return template_obj

@router.put("/workout-templates/{template_id}", response_model=WorkoutTemplateSchema)
def update_workout_template(
    *,
    db: Session = Depends(dependencies.get_db),
    template_id: int,
    template_in: WorkoutTemplateUpdate,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    template_obj = workout_template.get(db, id=template_id)
    if not template_obj:
        raise HTTPException(status_code=404, detail="Workout template not found")
    template_obj = workout_template.update(db, db_obj=template_obj, obj_in=template_in)
    return template_obj

@router.delete("/workout-templates/{template_id}")
def delete_workout_template(
    *,
    db: Session = Depends(dependencies.get_db),
    template_id: int,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    template_obj = workout_template.get(db, id=template_id)
    if not template_obj:
        raise HTTPException(status_code=404, detail="Workout template not found")
    workout_template.remove(db, id=template_id)
    return {"message": "Workout template deleted successfully"}

# Template Exercise Management
@router.post("/workout-templates/{template_id}/exercises", response_model=WorkoutTemplateExerciseSchema)
def add_exercise_to_template(
    *,
    db: Session = Depends(dependencies.get_db),
    template_id: int,
    exercise_in: WorkoutTemplateExerciseCreate,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    template = workout_template.get(db, id=template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Workout template not found")
    
    exercise_data = exercise_in.dict()
    template_exercise = workout_template.add_exercise_to_template(
        db, template_id=template_id, exercise_data=exercise_data
    )
    return template_exercise

@router.delete("/workout-templates/{template_id}/exercises/{exercise_id}")
def remove_exercise_from_template(
    *,
    db: Session = Depends(dependencies.get_db),
    template_id: int,
    exercise_id: int,
    current_user: User = Depends(dependencies.get_current_active_admin),
) -> Any:
    template = workout_template.get(db, id=template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Workout template not found")
    
    success = workout_template.remove_exercise_from_template(
        db, template_id=template_id, template_exercise_id=exercise_id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Template exercise not found")
    
    return {"message": "Exercise removed from template successfully"}