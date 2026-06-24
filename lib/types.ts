export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export interface Profile {
  userId: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'bulk' | 'cut' | 'maintain' | 'recomp';
  athleteType: 'hybrid' | 'strength' | 'endurance';
  units: 'metric' | 'imperial';
  updatedAt: string;
}

export interface MacroTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface FoodEntry {
  id: string;
  userId: string;
  date: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  createdAt: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  date: string;
  type: 'strength' | 'cardio' | 'hybrid';
  notes: string;
  exercises: ExerciseLog[];
  createdAt: string;
}

export interface ExerciseLog {
  id: string;
  name: string;
  sets: SetLog[];
}

export interface SetLog {
  reps: number;
  weightKg: number;
  distanceKm?: number;
  timeSec?: number;
}

export interface PRRecord {
  userId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  date: string;
}
