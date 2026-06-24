import { User, Profile, FoodEntry, WorkoutSession, PRRecord } from './types';

const KEYS = {
  users: 'ff_users',
  currentUser: 'ff_current_user',
  profiles: 'ff_profiles',
  food: 'ff_food',
  workouts: 'ff_workouts',
  prs: 'ff_prs',
};

function get<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function set<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Auth
export function getUsers(): User[] { return get<User>(KEYS.users); }
export function saveUser(user: User) {
  const users = getUsers().filter(u => u.id !== user.id);
  set(KEYS.users, [...users, user]);
}
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(KEYS.currentUser) || 'null'); } catch { return null; }
}
export function setCurrentUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
  else localStorage.removeItem(KEYS.currentUser);
}

// Profile
export function getProfile(userId: string): Profile | null {
  const all = get<Profile>(KEYS.profiles);
  return all.find(p => p.userId === userId) || null;
}
export function saveProfile(profile: Profile) {
  const all = get<Profile>(KEYS.profiles).filter(p => p.userId !== profile.userId);
  set(KEYS.profiles, [...all, profile]);
}

// Food
export function getFoodEntries(userId: string, date: string): FoodEntry[] {
  return get<FoodEntry>(KEYS.food).filter(f => f.userId === userId && f.date === date);
}
export function saveFoodEntry(entry: FoodEntry) {
  const all = get<FoodEntry>(KEYS.food);
  set(KEYS.food, [...all, entry]);
}
export function deleteFoodEntry(id: string) {
  set(KEYS.food, get<FoodEntry>(KEYS.food).filter(f => f.id !== id));
}

// Workouts
export function getWorkouts(userId: string): WorkoutSession[] {
  return get<WorkoutSession>(KEYS.workouts)
    .filter(w => w.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
}
export function saveWorkout(session: WorkoutSession) {
  const all = get<WorkoutSession>(KEYS.workouts).filter(w => w.id !== session.id);
  set(KEYS.workouts, [...all, session]);
}
export function deleteWorkout(id: string) {
  set(KEYS.workouts, get<WorkoutSession>(KEYS.workouts).filter(w => w.id !== id));
}

// PRs
export function getPRs(userId: string): PRRecord[] {
  return get<PRRecord>(KEYS.prs).filter(p => p.userId === userId);
}
export function updatePR(pr: PRRecord) {
  const all = get<PRRecord>(KEYS.prs);
  const existing = all.find(p => p.userId === pr.userId && p.exerciseName === pr.exerciseName);
  if (!existing || pr.weightKg > existing.weightKg || (pr.weightKg === existing.weightKg && pr.reps > existing.reps)) {
    const filtered = all.filter(p => !(p.userId === pr.userId && p.exerciseName === pr.exerciseName));
    set(KEYS.prs, [...filtered, pr]);
    return true; // new PR!
  }
  return false;
}

// Get all food entries for a user (for history)
export function getAllFoodEntries(userId: string): FoodEntry[] {
  return get<FoodEntry>(KEYS.food)
    .filter(f => f.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
}
