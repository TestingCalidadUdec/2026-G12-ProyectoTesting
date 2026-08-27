from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.schemas.exercise import Exercise

class WorkoutTemplateExerciseBase(BaseModel):
    exercise_id: int
    order_index: int
    suggested_sets: Optional[int] = None
    suggested_reps: Optional[int] = None
    suggested_weight: Optional[float] = None
    suggested_duration: Optional[int] = None

class WorkoutTemplateExerciseCreate(WorkoutTemplateExerciseBase):
    pass

class WorkoutTemplateExercise(WorkoutTemplateExerciseBase):
    id: int
    template_id: int
    exercise: Exercise

    class Config:
        from_attributes = True

class WorkoutTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False

class WorkoutTemplateCreate(WorkoutTemplateBase):
    exercises: List[WorkoutTemplateExerciseCreate] = []

class WorkoutTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class WorkoutTemplate(WorkoutTemplateBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    template_exercises: List[WorkoutTemplateExercise] = []

    class Config:
        from_attributes = True

class ExerciseSetBase(BaseModel):
    set_number: int
    reps: Optional[int] = None
    weight: Optional[float] = None
    duration: Optional[int] = None
    rest_duration: Optional[int] = None
    completed: bool = False

class ExerciseSetCreate(ExerciseSetBase):
    pass

class ExerciseSetUpdate(BaseModel):
    set_number: Optional[int] = None
    reps: Optional[int] = None
    weight: Optional[float] = None
    duration: Optional[int] = None
    rest_duration: Optional[int] = None
    completed: Optional[bool] = None

class ExerciseSet(ExerciseSetBase):
    id: int

    class Config:
        from_attributes = True

class WorkoutExerciseBase(BaseModel):
    exercise_id: int
    order_index: int
    notes: Optional[str] = None

class WorkoutExerciseCreate(WorkoutExerciseBase):
    sets: List[ExerciseSetCreate] = []

# Need to import Exercise schema to avoid circular imports
from app.schemas.exercise import Exercise

class WorkoutExercise(WorkoutExerciseBase):
    id: int
    workout_id: int
    exercise: Exercise
    sets: List[ExerciseSet] = []

    class Config:
        from_attributes = True

class WorkoutBase(BaseModel):
    name: Optional[str] = None
    notes: Optional[str] = None
    template_id: Optional[int] = None

class WorkoutCreate(WorkoutBase):
    exercises: List[WorkoutExerciseCreate] = []

class WorkoutUpdate(BaseModel):
    name: Optional[str] = None
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None

class WorkoutHistory(BaseModel):
    id: int
    user_id: int
    name: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    template_id: Optional[int] = None

    class Config:
        from_attributes = True

class Workout(WorkoutBase):
    id: int
    user_id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    workout_exercises: List[WorkoutExercise] = []

    class Config:
        from_attributes = True