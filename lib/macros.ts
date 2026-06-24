import { Profile, MacroTargets } from './types';

export function calculateMacros(profile: Profile): MacroTargets {
  // Mifflin-St Jeor BMR
  let bmr: number;
  if (profile.gender === 'male') {
    bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const tdee = bmr * activityMultipliers[profile.activityLevel];

  const goalAdjustments = {
    bulk: 300,
    cut: -400,
    maintain: 0,
    recomp: -100,
  };
  const calories = Math.round(tdee + goalAdjustments[profile.goal]);

  // Protein: 2.2g/kg for bulk/recomp, 2.0g/kg otherwise
  const proteinG = Math.round(profile.weightKg * (profile.goal === 'bulk' || profile.goal === 'recomp' ? 2.2 : 2.0));
  const proteinCals = proteinG * 4;

  // Fat: 25% of calories
  const fatCals = calories * 0.25;
  const fatG = Math.round(fatCals / 9);

  // Carbs: fill the rest
  const carbCals = calories - proteinCals - fatCals;
  const carbsG = Math.round(carbCals / 4);

  return { calories, proteinG, carbsG: Math.max(0, carbsG), fatG };
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
