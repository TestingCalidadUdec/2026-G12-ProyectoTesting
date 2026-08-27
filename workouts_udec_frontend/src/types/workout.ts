import type { Exercise } from './exercise';

export const WorkoutStatus = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
} as const;

export type WorkoutStatus = typeof WorkoutStatus[keyof typeof WorkoutStatus];

export interface Workout {
  id: number;
  user_id: number;
  name?: string;
  started_at: string;
  completed_at?: string;
  notes?: string;
  template_id?: number;
  workout_exercises?: WorkoutExercise[];
}

export interface WorkoutCreate {
  name?: string;
  template_id?: number;
  notes?: string;
}

export interface WorkoutUpdate {
  name?: string;
  notes?: string;
  completed_at?: string;
}

export interface WorkoutExercise {
  id: number;
  workout_id: number;
  exercise_id: number;
  exercise: Exercise;
  order_index: number;
  notes?: string;
  sets?: ExerciseSet[];
}

export interface WorkoutExerciseCreate {
  exercise_id: number;
  order_index: number;
  notes?: string;
}

export interface WorkoutExerciseUpdate {
  order_index?: number;
  notes?: string;
}

export interface ExerciseSet {
  id: number;
  workout_exercise_id: number;
  set_number: number;
  reps?: number;
  weight?: number;
  duration?: number;
  rest_duration?: number;
  notes?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExerciseSetCreate {
  set_number: number;
  reps?: number;
  weight?: number;
  duration?: number;
  rest_duration?: number;
  notes?: string;
  completed?: boolean;
}

export interface ExerciseSetUpdate {
  reps?: number;
  weight?: number;
  duration?: number;
  rest_duration?: number;
  notes?: string;
  completed?: boolean;
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  template_exercises?: WorkoutTemplateExercise[];
}

export interface WorkoutTemplateExerciseCreate {
  exercise_id: number;
  order_index: number;
  suggested_sets?: number;
  suggested_reps?: number;
  suggested_weight?: number;
  suggested_duration?: number;
}

export interface WorkoutTemplateCreate {
  name: string;
  description?: string;
  is_public?: boolean;
  exercises?: WorkoutTemplateExerciseCreate[];
}

export interface WorkoutTemplateUpdate {
  name?: string;
  description?: string;
  is_public?: boolean;
}

export interface WorkoutTemplateExercise {
  id: number;
  template_id: number;
  exercise_id: number;
  exercise?: Exercise;
  order_index: number;
  suggested_sets?: number;
  suggested_reps?: number;
  suggested_weight?: number;
  suggested_duration?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutTemplateExerciseCreate {
  exercise_id: number;
  order_index: number;
  suggested_sets?: number;
  suggested_reps?: number;
  suggested_weight?: number;
  suggested_duration?: number;
}

export interface WorkoutSummary {
  workout: Workout;
  total_exercises: number;
  total_sets: number;
  total_volume?: number;
  total_duration_minutes?: number;
}

export interface ExerciseProgression {
  exercise: Exercise;
  sessions: {
    date: string;
    best_set: ExerciseSet;
    total_volume?: number;
    total_reps?: number;
  }[];
  personal_records: {
    max_weight?: number;
    max_reps?: number;
    max_duration?: number;
    max_volume?: number;
  };
}