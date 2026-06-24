'use client';
import { useState } from 'react';
import { saveProfile } from '@/lib/storage';
import { Profile } from '@/lib/types';
import { lbsToKg, ftInToCm } from '@/lib/units';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, little movement' },
  { value: 'light', label: 'Lightly Active', desc: '1–3 workouts/week' },
  { value: 'moderate', label: 'Moderately Active', desc: '3–5 workouts/week' },
  { value: 'active', label: 'Very Active', desc: '6–7 workouts/week' },
  { value: 'very_active', label: 'Athlete', desc: '2x/day training' },
];

const GOAL_OPTIONS = [
  { value: 'bulk', label: '💪 Bulk', desc: 'Build muscle, gain weight' },
  { value: 'cut', label: '🔥 Cut', desc: 'Lose fat, keep muscle' },
  { value: 'maintain', label: '⚖️ Maintain', desc: 'Stay at current weight' },
  { value: 'recomp', label: '🔄 Recomposition', desc: 'Lose fat & build muscle' },
];

const ATHLETE_OPTIONS = [
  { value: 'hybrid', label: '🏃 Hybrid', desc: 'Lift + run' },
  { value: 'strength', label: '🏋️ Strength', desc: 'Primarily lifting' },
  { value: 'endurance', label: '🚴 Endurance', desc: 'Primarily cardio' },
];

export default function ProfileSetup({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [form, setForm] = useState({
    age: '', gender: 'male', weight: '', heightCm: '', heightFt: '', heightIn: '',
    activityLevel: 'moderate', goal: 'bulk', athleteType: 'hybrid',
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function getWeightKg() {
    return units === 'imperial' ? lbsToKg(Number(form.weight)) : Number(form.weight);
  }
  function getHeightCm() {
    return units === 'imperial' ? ftInToCm(Number(form.heightFt), Number(form.heightIn)) : Number(form.heightCm);
  }

  function handleSave() {
    const profile: Profile = {
      userId,
      age: Number(form.age),
      gender: form.gender as Profile['gender'],
      heightCm: getHeightCm(),
      weightKg: getWeightKg(),
      activityLevel: form.activityLevel as Profile['activityLevel'],
      goal: form.goal as Profile['goal'],
      athleteType: form.athleteType as Profile['athleteType'],
      units,
      updatedAt: new Date().toISOString(),
    };
    saveProfile(profile);
    onComplete();
  }

  const card = (children: React.ReactNode) => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', maxWidth: 520, margin: '0 auto' }}>
      {children}
    </div>
  );

  const stepLabel = (n: number, label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{n}</div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Step {n} of 3</div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>{label}</div>
      </div>
    </div>
  );

  const canStep1 = form.age && form.weight && (units === 'metric' ? form.heightCm : form.heightFt);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)' }}>MACRO<span style={{ color: 'var(--text)' }}>FORGE</span></div>
          <p style={{ color: 'var(--muted)', marginTop: 4 }}>Let&apos;s set up your profile</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: '2rem' }}>
          {[1,2,3].map(n => (
            <div key={n} style={{ width: n === step ? 24 : 8, height: 8, borderRadius: 4, background: n <= step ? 'var(--accent)' : 'var(--border)', transition: 'all 0.3s' }} />
          ))}
        </div>

        {step === 1 && card(
          <>
            {stepLabel(1, 'About You')}

            {/* Units toggle */}
            <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 8, padding: 3, marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
              {(['metric', 'imperial'] as const).map(u => (
                <button key={u} onClick={() => setUnits(u)} style={{
                  flex: 1, padding: '7px', borderRadius: 6,
                  background: units === u ? 'var(--accent)' : 'transparent',
                  color: units === u ? '#000' : 'var(--muted)',
                  fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                }}>
                  {u === 'metric' ? '🌍 Metric (kg / cm)' : '🇺🇸 Imperial (lbs / ft)'}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Age</label>
                <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" min="13" max="100" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                  Weight ({units === 'metric' ? 'kg' : 'lbs'})
                </label>
                <input type="number" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder={units === 'metric' ? '77' : '170'} />
              </div>
              {units === 'metric' ? (
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Height (cm)</label>
                  <input type="number" value={form.heightCm} onChange={e => set('heightCm', e.target.value)} placeholder="178" />
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Height</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input type="number" value={form.heightFt} onChange={e => set('heightFt', e.target.value)} placeholder="5" style={{ width: '50%' }} />
                    <input type="number" value={form.heightIn} onChange={e => set('heightIn', e.target.value)} placeholder="10" style={{ width: '50%' }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>ft &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; in</div>
                </div>
              )}
            </div>
            <button onClick={() => setStep(2)} disabled={!canStep1}
              style={{ width: '100%', background: 'var(--accent)', color: '#000', padding: '12px', marginTop: '1.5rem', fontWeight: 700, borderRadius: 8, opacity: !canStep1 ? 0.4 : 1 }}>
              Next →
            </button>
          </>
        )}

        {step === 2 && card(
          <>
            {stepLabel(2, 'Your Goal')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.5rem' }}>
              {GOAL_OPTIONS.map(g => (
                <button key={g.value} onClick={() => set('goal', g.value)} style={{
                  padding: '14px', borderRadius: 10, textAlign: 'left',
                  background: form.goal === g.value ? '#c8ff0015' : 'var(--surface2)',
                  border: `2px solid ${form.goal === g.value ? 'var(--accent)' : 'var(--border)'}`,
                  color: 'var(--text)', transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{g.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{g.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: 'var(--surface2)', color: 'var(--text)', padding: '12px', borderRadius: 8 }}>← Back</button>
              <button onClick={() => setStep(3)} style={{ flex: 2, background: 'var(--accent)', color: '#000', padding: '12px', fontWeight: 700, borderRadius: 8 }}>Next →</button>
            </div>
          </>
        )}

        {step === 3 && card(
          <>
            {stepLabel(3, 'Training Style')}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Athlete Type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ATHLETE_OPTIONS.map(a => (
                  <button key={a.value} onClick={() => set('athleteType', a.value)} style={{
                    padding: '12px 16px', borderRadius: 10, textAlign: 'left',
                    background: form.athleteType === a.value ? '#c8ff0015' : 'var(--surface2)',
                    border: `2px solid ${form.athleteType === a.value ? 'var(--accent)' : 'var(--border)'}`,
                    color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 600 }}>{a.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Activity Level</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ACTIVITY_OPTIONS.map(a => (
                  <button key={a.value} onClick={() => set('activityLevel', a.value)} style={{
                    padding: '10px 14px', borderRadius: 8, textAlign: 'left',
                    background: form.activityLevel === a.value ? '#c8ff0015' : 'var(--surface2)',
                    border: `1px solid ${form.activityLevel === a.value ? 'var(--accent)' : 'var(--border)'}`,
                    color: 'var(--text)', display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{a.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: 'var(--surface2)', color: 'var(--text)', padding: '12px', borderRadius: 8 }}>← Back</button>
              <button onClick={handleSave} style={{ flex: 2, background: 'var(--accent)', color: '#000', padding: '12px', fontWeight: 700, borderRadius: 8 }}>
                🚀 Start Tracking
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
