'use client';
import { useState, useEffect } from 'react';
import { WorkoutSession, ExerciseLog, SetLog, PRRecord } from '@/lib/types';
import { getWorkouts, saveWorkout, deleteWorkout, getPRs, updatePR } from '@/lib/storage';
import { uid, today, formatDate } from '@/lib/macros';
import { kgToDisplay, weightLabel, weightToKg } from '@/lib/units';

const EXERCISE_PRESETS = {
  strength: ['Squat', 'Deadlift', 'Bench Press', 'Overhead Press', 'Barbell Row', 'Pull-up', 'Dip', 'Incline Press', 'Romanian Deadlift', 'Hip Thrust', 'Leg Press', 'Lat Pulldown'],
  cardio: ['Running', '5K Run', '10K Run', 'Cycling', 'Rowing', 'Jump Rope', 'Swimming'],
  hybrid: ['Squat', 'Deadlift', 'Bench Press', 'Running', '5K Run', 'Pull-up', 'Overhead Press', 'Barbell Row'],
};

export default function WorkoutTracker({ userId, athleteType, units }: { userId: string; athleteType: string; units: 'metric' | 'imperial' }) {
  const [view, setView] = useState<'log' | 'history' | 'prs'>('log');
  const [selectedDate, setSelectedDate] = useState(today());
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [prs, setPRs] = useState<PRRecord[]>([]);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [newPRs, setNewPRs] = useState<string[]>([]);
  const [customExercise, setCustomExercise] = useState('');
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  useEffect(() => { setWorkouts(getWorkouts(userId)); setPRs(getPRs(userId)); }, [userId]);

  const wLabel = weightLabel(units);

  function changeDate(delta: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    const nd = d.toISOString().split('T')[0];
    if (nd <= today()) setSelectedDate(nd);
  }

  // Workouts for selected date
  const dayWorkouts = workouts.filter(w => w.date === selectedDate);

  function startSession(type: WorkoutSession['type']) {
    setSession({ id: uid(), userId, date: selectedDate, type, notes: '', exercises: [], createdAt: new Date().toISOString() });
    setNewPRs([]);
  }

  function addExercise(name: string) {
    if (!session) return;
    const ex: ExerciseLog = { id: uid(), name, sets: [{ reps: 0, weightKg: 0 }] };
    setSession(s => s ? { ...s, exercises: [...s.exercises, ex] } : null);
  }

  function addSet(exId: string) {
    if (!session) return;
    setSession(s => s ? {
      ...s, exercises: s.exercises.map(e => e.id === exId ? { ...e, sets: [...e.sets, { reps: 0, weightKg: 0 }] } : e)
    } : null);
  }

  function updateSet(exId: string, setIdx: number, field: 'weightKg' | 'reps' | 'distanceKm' | 'timeSec', rawValue: number) {
    if (!session) return;
    // Convert weight input to kg for storage
    const value = (field === 'weightKg') ? weightToKg(rawValue, units) : rawValue;
    setSession(s => s ? {
      ...s, exercises: s.exercises.map(e => e.id === exId ? {
        ...e, sets: e.sets.map((st, i) => i === setIdx ? { ...st, [field]: value } : st)
      } : e)
    } : null);
  }

  function removeExercise(exId: string) {
    if (!session) return;
    setSession(s => s ? { ...s, exercises: s.exercises.filter(e => e.id !== exId) } : null);
  }

  function removeSet(exId: string, setIdx: number) {
    if (!session) return;
    setSession(s => s ? {
      ...s, exercises: s.exercises.map(e => e.id === exId ? { ...e, sets: e.sets.filter((_, i) => i !== setIdx) } : e)
    } : null);
  }

  function finishSession() {
    if (!session) return;
    const detected: string[] = [];
    session.exercises.forEach(ex => {
      ex.sets.forEach(st => {
        if (st.weightKg > 0 && st.reps > 0) {
          const isNew = updatePR({ userId, exerciseName: ex.name, weightKg: st.weightKg, reps: st.reps, date: selectedDate });
          if (isNew) detected.push(ex.name);
        }
      });
    });
    saveWorkout(session);
    setWorkouts(getWorkouts(userId));
    setPRs(getPRs(userId));
    setNewPRs(detected);
    setSession(null);
    if (detected.length > 0) setTimeout(() => setNewPRs([]), 8000);
  }

  const presets = EXERCISE_PRESETS[session?.type as keyof typeof EXERCISE_PRESETS] || EXERCISE_PRESETS.hybrid;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {newPRs.length > 0 && (
        <div style={{ background: '#c8ff0015', border: '2px solid var(--accent)', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>🏆 NEW PERSONAL RECORD{newPRs.length > 1 ? 'S' : ''}!</div>
          <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>{newPRs.join(' · ')}</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Keep pushing. You&apos;re getting stronger!</div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 10, padding: 4, marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
        {[['log', '🏋️ Log'], ['history', '📅 History'], ['prs', '🏆 PRs']].map(([v, label]) => (
          <button key={v} onClick={() => { setView(v as typeof view); setSession(null); }} style={{
            flex: 1, padding: '8px 4px', borderRadius: 7, fontSize: 13,
            background: view === v ? 'var(--accent)' : 'transparent',
            color: view === v ? '#000' : 'var(--muted)', fontWeight: 600, transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {/* Date nav — shown on log and history */}
      {(view === 'log' || view === 'history') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <button onClick={() => changeDate(-1)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px', borderRadius: 8 }}>←</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedDate === today() ? 'Today' : formatDate(selectedDate)}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{selectedDate}</div>
          </div>
          <button onClick={() => changeDate(1)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px', borderRadius: 8 }}>→</button>
        </div>
      )}

      {/* LOG VIEW */}
      {view === 'log' && !session && (
        <div>
          {/* Workouts already logged this day */}
          {dayWorkouts.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Already logged today ({dayWorkouts.length})
              </div>
              {dayWorkouts.map(w => (
                <div key={w.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: w.type === 'strength' ? '#ff8800' : w.type === 'cardio' ? '#00aaff' : 'var(--accent)', textTransform: 'uppercase' }}>{w.type}</span>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{w.exercises.length} exercises · {w.exercises.reduce((a,e) => a + e.sets.length, 0)} sets</span>
                    </div>
                    <button onClick={() => setExpandedWorkout(expandedWorkout === w.id ? null : w.id)} style={{ background: 'none', color: 'var(--muted)', fontSize: 12, padding: '2px 8px', borderRadius: 6 }}>
                      {expandedWorkout === w.id ? '▲' : '▼'}
                    </button>
                  </div>
                  {expandedWorkout === w.id && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                      {w.exercises.map(ex => (
                        <div key={ex.id} style={{ marginBottom: 8 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{ex.name}</div>
                          {ex.sets.map((st, i) => (
                            <div key={i} style={{ fontSize: 12, color: 'var(--muted)', paddingLeft: 10 }}>
                              Set {i+1}: {kgToDisplay(st.weightKg, units)}{wLabel} × {st.reps} reps
                            </div>
                          ))}
                        </div>
                      ))}
                      {w.notes && <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginTop: 6 }}>&quot;{w.notes}&quot;</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: '1rem' }}>
            {dayWorkouts.length > 0 ? 'Log another workout' : 'Start a Workout'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {([['strength', '🏋️', 'Strength', 'Lifting'], ['cardio', '🏃', 'Cardio', 'Run / cycle'], ['hybrid', '⚡', 'Hybrid', 'Lift + run']] as const).map(([type, icon, label, desc]) => (
              <button key={type} onClick={() => startSession(type)} style={{
                background: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 12,
                padding: '1.5rem 1rem', color: 'var(--text)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <span style={{ fontSize: 28 }}>{icon}</span>
                <span style={{ fontWeight: 700 }}>{label}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE SESSION */}
      {view === 'log' && session && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{session.type.toUpperCase()} SESSION</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{selectedDate === today() ? 'Today' : formatDate(selectedDate)} · weights in {wLabel}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setSession(null)} style={{ background: 'var(--surface2)', color: 'var(--muted)', padding: '8px 14px', borderRadius: 8, fontSize: 13 }}>Discard</button>
              <button onClick={finishSession} style={{ background: 'var(--accent)', color: '#000', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Finish ✓</button>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Add Exercise</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {presets.filter(p => !session.exercises.find(e => e.name === p)).map(p => (
                <button key={p} onClick={() => addExercise(p)} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)',
                  padding: '5px 12px', borderRadius: 20, fontSize: 12,
                }}>+ {p}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={customExercise} onChange={e => setCustomExercise(e.target.value)} placeholder="Custom exercise..."
                onKeyDown={e => { if (e.key === 'Enter' && customExercise) { addExercise(customExercise); setCustomExercise(''); } }} />
              <button onClick={() => { if (customExercise) { addExercise(customExercise); setCustomExercise(''); } }}
                style={{ background: 'var(--accent)', color: '#000', padding: '0 16px', borderRadius: 8, fontWeight: 700 }}>Add</button>
            </div>
          </div>

          <textarea value={session.notes} onChange={e => setSession(s => s ? { ...s, notes: e.target.value } : null)}
            placeholder="Session notes..." rows={2} style={{ marginBottom: '1rem' }} />

          {session.exercises.map(ex => (
            <div key={ex.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                <button onClick={() => removeExercise(ex.id)} style={{ background: 'none', color: 'var(--muted)', padding: '2px 8px', fontSize: 14, borderRadius: 6 }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 32px', gap: 6, marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>Set</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
                  {session.type === 'cardio' ? 'Dist (km)' : `Weight (${wLabel})`}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
                  {session.type === 'cardio' ? 'Time (min)' : 'Reps'}
                </div>
                <div />
              </div>
              {ex.sets.map((st, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 32px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', fontWeight: 600 }}>{i+1}</div>
                  <input type="number" defaultValue={session.type === 'cardio' ? (st.distanceKm || '') : (kgToDisplay(st.weightKg, units) || '')}
                    min="0" step={units === 'imperial' ? '1' : '0.5'}
                    onChange={e => updateSet(ex.id, i, session.type === 'cardio' ? 'distanceKm' : 'weightKg', Number(e.target.value))}
                    placeholder="0" style={{ textAlign: 'center', padding: '8px' }} />
                  <input type="number" defaultValue={session.type === 'cardio' ? (st.timeSec ? Math.round(st.timeSec/60) : '') : (st.reps || '')}
                    min="0"
                    onChange={e => updateSet(ex.id, i, session.type === 'cardio' ? 'timeSec' : 'reps', Number(e.target.value))}
                    placeholder="0" style={{ textAlign: 'center', padding: '8px' }} />
                  <button onClick={() => removeSet(ex.id, i)} style={{ background: 'none', color: 'var(--muted)', padding: '4px', fontSize: 13, borderRadius: 4 }}>✕</button>
                </div>
              ))}
              <button onClick={() => addSet(ex.id)} style={{ background: 'var(--surface2)', border: '1px dashed var(--border)', color: 'var(--muted)', padding: '6px', width: '100%', borderRadius: 8, fontSize: 12, marginTop: 4 }}>
                + Add Set
              </button>
              {(() => {
                const pr = prs.find(p => p.exerciseName === ex.name);
                return pr ? <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 6 }}>🏆 Current PR: {kgToDisplay(pr.weightKg, units)}{wLabel} × {pr.reps} reps</div> : null;
              })()}
            </div>
          ))}
          {session.exercises.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: 14 }}>Add exercises above to start logging sets.</div>
          )}
        </div>
      )}

      {/* HISTORY VIEW */}
      {view === 'history' && (
        <div>
          {dayWorkouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏋️</div>
              <div>No workouts logged on {selectedDate === today() ? 'today' : formatDate(selectedDate)}.</div>
              <button onClick={() => setView('log')} style={{ marginTop: 12, background: 'var(--accent)', color: '#000', padding: '8px 20px', borderRadius: 8, fontWeight: 700 }}>Log one now</button>
            </div>
          ) : dayWorkouts.map(w => (
            <div key={w.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ background: w.type === 'hybrid' ? '#c8ff0020' : w.type === 'strength' ? '#ff880020' : '#00aaff20',
                    color: w.type === 'hybrid' ? 'var(--accent)' : w.type === 'strength' ? '#ff8800' : '#00aaff',
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' }}>
                    {w.type}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{w.exercises.length} exercises</span>
                </div>
                <button onClick={() => { deleteWorkout(w.id); setWorkouts(getWorkouts(userId)); }}
                  style={{ background: 'none', color: 'var(--muted)', padding: '4px 8px', fontSize: 13, borderRadius: 6 }}>✕</button>
              </div>
              {w.exercises.map(ex => (
                <div key={ex.id} style={{ marginBottom: 10, paddingLeft: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{ex.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {ex.sets.map((st, i) => (
                      <span key={i} style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 20 }}>
                        {kgToDisplay(st.weightKg, units)}{wLabel} × {st.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {w.notes && <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>&quot;{w.notes}&quot;</div>}
            </div>
          ))}
        </div>
      )}

      {/* PRs VIEW */}
      {view === 'prs' && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: '0.5rem' }}>Personal Records</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem' }}>Auto-detected when you log a new best. Showing in {units}.</div>
          {prs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
              <div>No PRs yet. Log a workout to start tracking your strength!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {prs.sort((a,b) => a.exerciseName.localeCompare(b.exerciseName)).map(pr => (
                <div key={pr.exerciseName} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>🏆 {pr.exerciseName}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>
                    {kgToDisplay(pr.weightKg, units)}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)', marginLeft: 2 }}>{wLabel}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text)', marginTop: 2 }}>× {pr.reps} reps</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Set on {formatDate(pr.date)}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    1RM est: ~{kgToDisplay(Math.round(pr.weightKg * (1 + pr.reps / 30)), units)}{wLabel}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
