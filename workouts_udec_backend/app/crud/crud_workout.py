from typing import List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from app.crud.base import CRUDBase
from app.models.workout import WorkoutTemplate, Workout, WorkoutExercise, WorkoutTemplateExercise
from app.schemas.workout import (
    WorkoutTemplateCreate, 
    WorkoutTemplateUpdate,
    WorkoutCreate,
    WorkoutUpdate
)

class CRUDWorkoutTemplate(CRUDBase[WorkoutTemplate, WorkoutTemplateCreate, WorkoutTemplateUpdate]):
    def create(self, db: Session, *, obj_in: WorkoutTemplateCreate, created_by: int) -> WorkoutTemplate:
        db_obj = WorkoutTemplate(
            name=obj_in.name,
            description=obj_in.description,
            is_public=obj_in.is_public,
            created_by=created_by
        )
        db.add(db_obj)
        db.flush()
        
        # Add template exercises if provided
        for exercise_data in obj_in.exercises:
            template_exercise = WorkoutTemplateExercise(
                template_id=db_obj.id,
                exercise_id=exercise_data.exercise_id,
                order_index=exercise_data.order_index,
                suggested_sets=exercise_data.suggested_sets,
                suggested_reps=exercise_data.suggested_reps,
                suggested_weight=exercise_data.suggested_weight,
                suggested_duration=exercise_data.suggested_duration
            )
            db.add(template_exercise)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_user(self, db: Session, *, user_id: int) -> List[WorkoutTemplate]:
        return db.query(WorkoutTemplate).filter(WorkoutTemplate.created_by == user_id).all()

    def get_public(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[WorkoutTemplate]:
        return db.query(WorkoutTemplate).filter(
            WorkoutTemplate.is_public == True
        ).offset(skip).limit(limit).all()

    def get_with_exercises(self, db: Session, id: int) -> WorkoutTemplate:
        return db.query(WorkoutTemplate).options(
            joinedload(WorkoutTemplate.template_exercises).joinedload(WorkoutTemplateExercise.exercise)
        ).filter(WorkoutTemplate.id == id).first()

    def get_multi_with_exercises(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[WorkoutTemplate]:
        return db.query(WorkoutTemplate).options(
            joinedload(WorkoutTemplate.template_exercises).joinedload(WorkoutTemplateExercise.exercise)
        ).offset(skip).limit(limit).all()

    def add_exercise_to_template(self, db: Session, *, template_id: int, exercise_data: Dict[str, Any]) -> WorkoutTemplateExercise:
        template_exercise = WorkoutTemplateExercise(
            template_id=template_id,
            **exercise_data
        )
        db.add(template_exercise)
        db.commit()
        db.refresh(template_exercise)
        return template_exercise

    def remove_exercise_from_template(self, db: Session, *, template_id: int, template_exercise_id: int) -> bool:
        template_exercise = db.query(WorkoutTemplateExercise).filter(
            WorkoutTemplateExercise.template_id == template_id,
            WorkoutTemplateExercise.id == template_exercise_id
        ).first()
        
        if template_exercise:
            db.delete(template_exercise)
            db.commit()
            return True
        return False

    def update_template_exercises(self, db: Session, *, template_id: int, exercises_data: List[Dict[str, Any]]) -> List[WorkoutTemplateExercise]:
        # Remove existing template exercises
        db.query(WorkoutTemplateExercise).filter(
            WorkoutTemplateExercise.template_id == template_id
        ).delete()
        
        # Add new template exercises
        new_exercises = []
        for exercise_data in exercises_data:
            template_exercise = WorkoutTemplateExercise(
                template_id=template_id,
                **exercise_data
            )
            db.add(template_exercise)
            new_exercises.append(template_exercise)
        
        db.commit()
        for exercise in new_exercises:
            db.refresh(exercise)
        return new_exercises

    def remove(self, db: Session, *, id: int) -> WorkoutTemplate:
        # First delete all associated template exercises
        db.query(WorkoutTemplateExercise).filter(
            WorkoutTemplateExercise.template_id == id
        ).delete()
        
        # Then delete the template
        template = db.query(WorkoutTemplate).filter(WorkoutTemplate.id == id).first()
        if template:
            db.delete(template)
            db.commit()
        return template

class CRUDWorkout(CRUDBase[Workout, WorkoutCreate, WorkoutUpdate]):
    def create(self, db: Session, *, obj_in: Dict[str, Any]) -> Workout:
        db_obj = Workout(
            user_id=obj_in["user_id"],
            name=obj_in.get("name"),
            notes=obj_in.get("notes"),
            template_id=obj_in.get("template_id")
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_user(self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100) -> List[Workout]:
        return db.query(Workout).filter(
            Workout.user_id == user_id
        ).order_by(Workout.started_at.desc()).offset(skip).limit(limit).all()

    def get(self, db: Session, id: int) -> Workout:
        return db.query(Workout).options(
            joinedload(Workout.workout_exercises).joinedload(WorkoutExercise.exercise),
            joinedload(Workout.workout_exercises).joinedload(WorkoutExercise.sets)
        ).filter(Workout.id == id).first()

    def get_active_by_user(self, db: Session, *, user_id: int) -> Workout:
        return db.query(Workout).options(
            joinedload(Workout.workout_exercises).joinedload(WorkoutExercise.exercise),
            joinedload(Workout.workout_exercises).joinedload(WorkoutExercise.sets)
        ).filter(
            Workout.user_id == user_id,
            Workout.completed_at.is_(None)
        ).first()

    def get_completed_by_user(self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100) -> List[Workout]:
        return db.query(Workout).options(
            joinedload(Workout.workout_exercises).joinedload(WorkoutExercise.exercise),
            joinedload(Workout.workout_exercises).joinedload(WorkoutExercise.sets)
        ).filter(
            Workout.user_id == user_id,
            Workout.completed_at.isnot(None)
        ).order_by(Workout.completed_at.desc()).offset(skip).limit(limit).all()

    def create_from_template(self, db: Session, *, template, workout_data: Dict[str, Any]) -> Workout:
        from app.models.workout import ExerciseSet
        
        # Create the workout
        new_workout = self.create(db, obj_in=workout_data)
        
        # Add exercises from template
        for template_exercise in template.template_exercises:
            workout_exercise = WorkoutExercise(
                workout_id=new_workout.id,
                exercise_id=template_exercise.exercise_id,
                order_index=template_exercise.order_index,
                notes=None
            )
            db.add(workout_exercise)
            db.flush()  # Flush to get the workout_exercise.id
            
            # Create recommended sets based on template suggestions
            suggested_sets = template_exercise.suggested_sets or 1
            for set_number in range(1, suggested_sets + 1):
                exercise_set = ExerciseSet(
                    workout_exercise_id=workout_exercise.id,
                    set_number=set_number,
                    reps=template_exercise.suggested_reps,
                    weight=template_exercise.suggested_weight,
                    duration=template_exercise.suggested_duration,
                    rest_duration=None,
                    completed=False
                )
                db.add(exercise_set)
        
        db.commit()
        
        # Return workout with exercises loaded
        return db.query(Workout).options(
            joinedload(Workout.workout_exercises).joinedload(WorkoutExercise.exercise),
            joinedload(Workout.workout_exercises).joinedload(WorkoutExercise.sets)
        ).filter(Workout.id == new_workout.id).first()

    def cancel_workout(self, db: Session, *, workout_id: int) -> None:
        """Cancel a workout and remove all associated data."""
        from app.models.workout import WorkoutExercise, ExerciseSet
        
        # Delete all exercise sets first
        workout_exercises = db.query(WorkoutExercise).filter(WorkoutExercise.workout_id == workout_id).all()
        for workout_exercise in workout_exercises:
            # Delete all sets for this workout exercise
            db.query(ExerciseSet).filter(ExerciseSet.workout_exercise_id == workout_exercise.id).delete()
            # Delete the workout exercise
            db.delete(workout_exercise)
        
        # Now delete the workout itself
        workout_obj = self.get(db, id=workout_id)
        if workout_obj:
            db.delete(workout_obj)
        
        db.commit()

    def add_exercise_to_workout(self, db: Session, *, workout_id: int, exercise_data) -> WorkoutExercise:
        """Add an exercise to a workout with optional sets."""
        workout_exercise = WorkoutExercise(
            workout_id=workout_id,
            exercise_id=exercise_data.exercise_id,
            order_index=exercise_data.order_index,
            notes=exercise_data.notes
        )
        db.add(workout_exercise)
        db.flush()
        
        # Add sets if provided
        from app.models.workout import ExerciseSet
        for set_data in exercise_data.sets:
            exercise_set = ExerciseSet(
                workout_exercise_id=workout_exercise.id,
                set_number=set_data.set_number,
                reps=set_data.reps,
                weight=set_data.weight,
                duration=set_data.duration,
                rest_duration=set_data.rest_duration,
                completed=set_data.completed
            )
            db.add(exercise_set)
        
        db.commit()
        db.refresh(workout_exercise)
        
        # Return with exercise relationship loaded
        return db.query(WorkoutExercise).options(
            joinedload(WorkoutExercise.exercise),
            joinedload(WorkoutExercise.sets)
        ).filter(WorkoutExercise.id == workout_exercise.id).first()

    def add_set_to_exercise(self, db: Session, *, workout_id: int, exercise_id: int, set_data) -> 'ExerciseSet':
        """Add a set to a workout exercise."""
        from app.models.workout import WorkoutExercise, ExerciseSet
        
        # Verify workout exercise exists
        workout_exercise = db.query(WorkoutExercise).filter(
            WorkoutExercise.workout_id == workout_id,
            WorkoutExercise.id == exercise_id
        ).first()
        
        if not workout_exercise:
            raise ValueError("Exercise not found in workout")
        
        exercise_set = ExerciseSet(
            workout_exercise_id=exercise_id,
            set_number=set_data.set_number,
            reps=set_data.reps,
            weight=set_data.weight,
            duration=set_data.duration,
            rest_duration=set_data.rest_duration,
            completed=set_data.completed
        )
        db.add(exercise_set)
        db.commit()
        db.refresh(exercise_set)
        return exercise_set

    def update_exercise_set(self, db: Session, *, workout_id: int, exercise_id: int, set_id: int, set_data) -> 'ExerciseSet':
        """Update an exercise set."""
        from app.models.workout import ExerciseSet
        
        exercise_set = db.query(ExerciseSet).filter(
            ExerciseSet.id == set_id,
            ExerciseSet.workout_exercise_id == exercise_id
        ).first()
        
        if not exercise_set:
            raise ValueError("Exercise set not found")
        
        for field, value in set_data.model_dump(exclude_unset=True).items():
            setattr(exercise_set, field, value)
        
        db.commit()
        db.refresh(exercise_set)
        return exercise_set

    def delete_exercise_set(self, db: Session, *, workout_id: int, exercise_id: int, set_id: int) -> None:
        """Delete an exercise set."""
        from app.models.workout import ExerciseSet
        
        exercise_set = db.query(ExerciseSet).filter(
            ExerciseSet.id == set_id,
            ExerciseSet.workout_exercise_id == exercise_id
        ).first()
        
        if not exercise_set:
            raise ValueError("Exercise set not found")
        
        db.delete(exercise_set)
        db.commit()

    def get_exercise_progression(self, db: Session, *, user_id: int, exercise_id: int, limit: int = 10) -> list:
        """Get exercise progression data for a user and exercise."""
        from app.models.workout import WorkoutExercise, ExerciseSet
        from sqlalchemy.orm import joinedload
        
        # Get previous completed workouts with this exercise
        previous_workouts = db.query(WorkoutExercise).options(
            joinedload(WorkoutExercise.workout),
            joinedload(WorkoutExercise.sets)
        ).join(Workout).filter(
            Workout.user_id == user_id,
            WorkoutExercise.exercise_id == exercise_id,
            Workout.completed_at.isnot(None)
        ).order_by(Workout.started_at.desc()).limit(limit).all()
        
        progression_data = []
        for workout_exercise in previous_workouts:
            workout_data = {
                "workout_id": workout_exercise.workout_id,
                "date": workout_exercise.workout.started_at,
                "sets": []
            }
            
            for exercise_set in workout_exercise.sets:
                set_data = {
                    "set_number": exercise_set.set_number,
                    "reps": exercise_set.reps,
                    "weight": exercise_set.weight,
                    "duration": exercise_set.duration,
                    "completed": exercise_set.completed
                }
                workout_data["sets"].append(set_data)
            
            progression_data.append(workout_data)
        
        return progression_data

    def update_exercise_notes(self, db: Session, *, workout_id: int, exercise_id: int, notes: str):
        """Update notes for a workout exercise."""
        from app.models.workout import WorkoutExercise
        from sqlalchemy.orm import joinedload
        
        workout_exercise = db.query(WorkoutExercise).filter(
            WorkoutExercise.id == exercise_id,
            WorkoutExercise.workout_id == workout_id
        ).first()
        
        if not workout_exercise:
            raise ValueError("Exercise not found in workout")
        
        workout_exercise.notes = notes
        db.commit()
        db.refresh(workout_exercise)
        
        # Return the exercise with relationships loaded for the response
        workout_exercise_with_exercise = db.query(WorkoutExercise).options(
            joinedload(WorkoutExercise.exercise),
            joinedload(WorkoutExercise.sets)
        ).filter(WorkoutExercise.id == exercise_id).first()
        
        return workout_exercise_with_exercise

workout_template = CRUDWorkoutTemplate(WorkoutTemplate)
workout = CRUDWorkout(Workout)