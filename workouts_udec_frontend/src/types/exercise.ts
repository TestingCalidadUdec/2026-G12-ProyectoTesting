export const ExerciseType = {
  WEIGHT_BASED: "WEIGHT_BASED",
  TIME_BASED: "TIME_BASED"
} as const;

export type ExerciseType = typeof ExerciseType[keyof typeof ExerciseType];

export interface Exercise {
  id: number;
  name: string;
  description?: string;
  exercise_type: ExerciseType;
  muscle_group?: string;
  equipment?: string;
  instructions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExerciseCreate {
  name: string;
  description?: string;
  exercise_type: ExerciseType;
  muscle_group?: string;
  equipment?: string;
  instructions?: string;
  is_active?: boolean;
}

export interface ExerciseUpdate {
  name?: string;
  description?: string;
  exercise_type?: ExerciseType;
  muscle_group?: string;
  equipment?: string;
  instructions?: string;
  is_active?: boolean;
}