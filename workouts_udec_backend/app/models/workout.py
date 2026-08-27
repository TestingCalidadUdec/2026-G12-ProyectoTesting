from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    creator = relationship("User")
    template_exercises = relationship("WorkoutTemplateExercise", back_populates="template")

class WorkoutTemplateExercise(Base):
    __tablename__ = "workout_template_exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("workout_templates.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    suggested_sets = Column(Integer, nullable=True)
    suggested_reps = Column(Integer, nullable=True)
    suggested_weight = Column(Float, nullable=True)
    suggested_duration = Column(Integer, nullable=True)  # in seconds
    
    template = relationship("WorkoutTemplate", back_populates="template_exercises")
    exercise = relationship("Exercise")

class Workout(Base):
    __tablename__ = "workouts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    template_id = Column(Integer, ForeignKey("workout_templates.id"), nullable=True)
    
    user = relationship("User")
    template = relationship("WorkoutTemplate")
    workout_exercises = relationship("WorkoutExercise", back_populates="workout")

class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    
    workout = relationship("Workout", back_populates="workout_exercises")
    exercise = relationship("Exercise")
    sets = relationship("ExerciseSet", back_populates="workout_exercise")

class ExerciseSet(Base):
    __tablename__ = "exercise_sets"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_exercise_id = Column(Integer, ForeignKey("workout_exercises.id"), nullable=False)
    set_number = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)
    duration = Column(Integer, nullable=True)  # in seconds
    rest_duration = Column(Integer, nullable=True)  # in seconds
    completed = Column(Boolean, default=False)
    
    workout_exercise = relationship("WorkoutExercise", back_populates="sets")