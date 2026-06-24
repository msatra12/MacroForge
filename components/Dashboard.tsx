'use client';
import { useState, useEffect } from 'react';
import { User, Profile, MacroTargets } from '@/lib/types';
import { getProfile, getWorkouts, getFoodEntries, setCurrentUser } from '@/lib/storage';
import { calculateMacros, today } from '@/lib/macros';
import CalorieTracker from './CalorieTracker';
import WorkoutTracker from './WorkoutTracker';
import ProfileSetup from './ProfileSetup';

type Tab = 'home' | 'calories' | 'workout' | 'profile';

export default function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('home');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [targets, setTargets] = useState<MacroTargets | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    const p = getProfile(user.id);
    if (!p) { setNeedsProfile(true); return; }
    setProfile(p);
    setTargets(calculateMacros(p));
  }, [user.id]);

  function handleProfileComplete() {
    const p = getProfile(user.id);
    setProfile(p);
    if (p) setTargets(calculateMacros(p));
    setNeedsProfile(false);
    setTab('home');
  }

  if (needsProfile) return <ProfileSetup userId={user.id} onComplete={handleProfileComplete} />;

  const workouts = getWorkouts(user.id);
  const todayFood = getFoodEntries(user.id, today());
  const todayCalories = todayFood.reduce((a, f) => a + f.calories, 0);
  const todayProtein = todayFood.reduce((a, f) => a + f.proteinG, 0);
  const recentWorkout = workouts[0];

  const NAV = [
    { key: 'home', icon: '🏠', label: 'Home' },
    { key: 'calories', icon: '🥗', label: 'Calories' },
    { key: 'workout', icon: '🏋️', label: 'Workout' },
    { key: 'profile', icon: '👤', label: 'Profile' },
  ] as const;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.5px' }}>MACRO<span style={{ color: 'var(--text)' }}>FORGE</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>👋 {user.name.split(' ')[0]}</span>
          <button onClick={() => { setCurrentUser(null); onLogout(); }} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '6px 12px', borderRadius: 6, fontSize: 12 }}>Log out</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '1.5rem', paddingBottom: '5rem', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        {tab === 'home' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>Welcome back, {user.name.split(' ')[0]} 💪</div>
              {profile && <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Goal: <span style={{ color: 'var(--accent)', fontWeight: 600, textTransform: 'capitalize' }}>{profile.goal}</span> · {profile.athleteType} athlete · {profile.weightKg}kg</div>}
            </div>

            {/* Today's summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
              {[
                { icon: '🔥', label: "Today's Calories", val: `${todayCalories} / ${targets?.calories ?? '—'}`, sub: 'kcal', color: todayCalories > (targets?.calories ?? 0) ? 'var(--danger)' : 'var(--accent)' },
                { icon: '🥩', label: "Today's Protein", val: `${todayProtein} / ${targets?.proteinG ?? '—'}`, sub: 'grams', color: 'var(--accent)' },
                { icon: '📅', label: 'Workouts Logged', val: workouts.length, sub: 'total sessions', color: '#00aaff' },
                { icon: '💪', label: 'Last Workout', val: recentWorkout ? recentWorkout.type.toUpperCase() : '—', sub: recentWorkout ? recentWorkout.date : 'none yet', color: '#ff8800' },
              ].map(card => (
                <div key={card.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.2rem' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{card.icon}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{card.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: card.color, marginTop: 4 }}>{card.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Macro targets */}
            {targets && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.2rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)' }}>Daily Macro Targets</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { label: 'Calories', val: targets.calories, unit: 'kcal', color: 'var(--accent)' },
                    { label: 'Protein', val: `${targets.proteinG}g`, unit: '', color: '#c8ff00' },
                    { label: 'Carbs', val: `${targets.carbsG}g`, unit: '', color: '#00aaff' },
                    { label: 'Fat', val: `${targets.fatG}g`, unit: '', color: '#ff8800' },
                  ].map(m => (
                    <div key={m.label} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.label} {m.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => setTab('calories')} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '1rem', borderRadius: 12, fontWeight: 600 }}>
                🥗 Log Food
              </button>
              <button onClick={() => setTab('workout')} style={{ background: 'var(--accent)', color: '#000', padding: '1rem', borderRadius: 12, fontWeight: 700 }}>
                🏋️ Log Workout
              </button>
            </div>
          </div>
        )}

        {tab === 'calories' && targets && profile && (
          <CalorieTracker userId={user.id} targets={targets} profile={profile} />
        )}

        {tab === 'workout' && profile && (
          <WorkoutTracker userId={user.id} athleteType={profile.athleteType} units={profile.units ?? 'metric'} />
        )}

        {tab === 'profile' && profile && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: '1.5rem' }}>Your Profile</div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, marginBottom: '1rem' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>{user.email}</div>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '1rem' }}>Body Stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['Age', `${profile.age} years`],
                  ['Weight', `${profile.weightKg} kg`],
                  ['Height', `${profile.heightCm} cm`],
                  ['Gender', profile.gender],
                  ['Goal', profile.goal],
                  ['Athlete Type', profile.athleteType],
                  ['Activity', profile.activityLevel.replace('_', ' ')],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{k}</div>
                    <div style={{ fontWeight: 600, marginTop: 2, textTransform: 'capitalize' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setNeedsProfile(true)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px', width: '100%', borderRadius: 8, fontWeight: 600 }}>
              ✏️ Edit Profile & Goals
            </button>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', zIndex: 10 }}>
        {NAV.map(n => (
          <button key={n.key} onClick={() => setTab(n.key)} style={{
            flex: 1, padding: '10px 0 12px', background: 'none', color: tab === n.key ? 'var(--accent)' : 'var(--muted)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'color 0.2s', borderRadius: 0,
          }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
