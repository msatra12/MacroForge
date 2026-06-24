'use client';
import { useState, useEffect } from 'react';
import { MacroTargets, FoodEntry, Profile } from '@/lib/types';
import { getFoodEntries, saveFoodEntry, deleteFoodEntry, getAllFoodEntries } from '@/lib/storage';
import { uid, today, formatDate } from '@/lib/macros';

interface Props { userId: string; targets: MacroTargets; profile: Profile; }
interface FoodResult { name: string; calories: number; proteinG: number; carbsG: number; fatG: number; }

export default function CalorieTracker({ userId, targets, profile }: Props) {
  const [date, setDate] = useState(today());
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [foodName, setFoodName] = useState('');
  const [amount, setAmount] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FoodResult[]>([]);
  const [searchError, setSearchError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [allEntries, setAllEntries] = useState<FoodEntry[]>([]);

  useEffect(() => { setEntries(getFoodEntries(userId, date)); }, [userId, date]);

  const totals = entries.reduce((a, e) => ({
    calories: a.calories + e.calories,
    proteinG: a.proteinG + e.proteinG,
    carbsG: a.carbsG + e.carbsG,
    fatG: a.fatG + e.fatG,
  }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });

  async function searchFood() {
    if (!foodName.trim()) return;
    setSearching(true);
    setResults([]);
    setSearchError('');

    // Build a natural query combining food + amount
    const query = amount.trim()
      ? `${amount} ${foodName}`
      : foodName;

    try {
      const res = await fetch('/api/food-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.results);
    } catch {
      setSearchError('Could not look up that food. Check your internet connection or try again.');
    } finally {
      setSearching(false);
    }
  }

  function addResult(r: FoodResult) {
    const entry: FoodEntry = {
      id: uid(), userId, date,
      name: r.name, calories: r.calories,
      proteinG: r.proteinG, carbsG: r.carbsG, fatG: r.fatG,
      createdAt: new Date().toISOString(),
    };
    saveFoodEntry(entry);
    setEntries(getFoodEntries(userId, date));
    setResults([]);
    setFoodName('');
    setAmount('');
  }

  function remove(id: string) {
    deleteFoodEntry(id);
    setEntries(getFoodEntries(userId, date));
  }

  function changeDate(delta: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    const nd = d.toISOString().split('T')[0];
    if (nd <= today()) { setDate(nd); setResults([]); setFoodName(''); setAmount(''); }
  }

  function openHistory() {
    setAllEntries(getAllFoodEntries(userId));
    setShowHistory(true);
  }

  const historyByDate = allEntries.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  function MacroBar({ label, eaten, target, color }: { label: string; eaten: number; target: number; color: string }) {
    const pct = Math.min((eaten / target) * 100, 100);
    const over = eaten > target;
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
          <span style={{ color: 'var(--muted)' }}>{label}</span>
          <span style={{ color: over ? 'var(--danger)' : 'var(--text)', fontWeight: 600 }}>
            {Math.round(eaten)}g / {target}g {over && '⚠️'}
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: over ? 'var(--danger)' : color, borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
      </div>
    );
  }

  const calPct = Math.min((totals.calories / targets.calories) * 100, 100);
  const calOver = totals.calories > targets.calories;
  const calRemain = targets.calories - totals.calories;

  // History view
  if (showHistory) return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button onClick={() => setShowHistory(false)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px', borderRadius: 8 }}>← Back</button>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Food History</div>
      </div>
      {Object.keys(historyByDate).sort((a, b) => b.localeCompare(a)).map(d => {
        const dayEntries = historyByDate[d];
        const dayTotal = dayEntries.reduce((a, e) => a + e.calories, 0);
        const dayProtein = dayEntries.reduce((a, e) => a + e.proteinG, 0);
        const dayCarbs = dayEntries.reduce((a, e) => a + e.carbsG, 0);
        const dayFat = dayEntries.reduce((a, e) => a + e.fatG, 0);
        return (
          <div key={d} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>{d === today() ? 'Today' : formatDate(d)}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 15 }}>{dayTotal} kcal</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>P:{Math.round(dayProtein)}g · C:{Math.round(dayCarbs)}g · F:{Math.round(dayFat)}g</div>
              </div>
            </div>
            {dayEntries.map(e => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted)' }}>{e.name}</span>
                <span style={{ color: 'var(--text)' }}>{e.calories} kcal · P:{e.proteinG}g C:{e.carbsG}g F:{e.fatG}g</span>
              </div>
            ))}
          </div>
        );
      })}
      {Object.keys(historyByDate).length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No food logged yet.</div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Date nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button onClick={() => changeDate(-1)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px', borderRadius: 8 }}>←</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{date === today() ? 'Today' : formatDate(date)}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{date}</div>
        </div>
        <button onClick={() => changeDate(1)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px', borderRadius: 8 }}>→</button>
        <button onClick={openHistory} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>📋 History</button>
      </div>

      {/* Calorie ring */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
            <svg viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="55" cy="55" r="46" fill="none" stroke="var(--surface2)" strokeWidth="10" />
              <circle cx="55" cy="55" r="46" fill="none"
                stroke={calOver ? 'var(--danger)' : 'var(--accent)'}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - calPct / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.5s' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: calOver ? 'var(--danger)' : 'var(--accent)' }}>{Math.round(totals.calories)}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>kcal</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: '1rem' }}>
              {[
                { label: 'Goal', val: targets.calories, color: 'var(--text)' },
                { label: calOver ? 'Over by' : 'Remaining', val: Math.abs(calRemain), color: calOver ? 'var(--danger)' : 'var(--success)' },
                { label: 'Logged', val: entries.length, color: 'var(--text)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <MacroBar label="Protein" eaten={totals.proteinG} target={targets.proteinG} color="#c8ff00" />
              <MacroBar label="Carbs" eaten={totals.carbsG} target={targets.carbsG} color="#00aaff" />
              <MacroBar label="Fat" eaten={totals.fatG} target={targets.fatG} color="#ff8800" />
            </div>
          </div>
        </div>
        {calOver && (
          <div style={{ background: '#ff444415', border: '1px solid #ff444430', borderRadius: 8, padding: '10px 14px', marginTop: '1rem', fontSize: 13, color: '#ff8888' }}>
            ⚠️ You&apos;ve exceeded your {profile.goal} goal by <strong>{Math.abs(calRemain)} kcal</strong>. Consider lighter meals for the rest of the day.
          </div>
        )}
        {!calOver && calRemain < 150 && totals.calories > 0 && (
          <div style={{ background: '#c8ff0010', border: '1px solid #c8ff0030', borderRadius: 8, padding: '10px 14px', marginTop: '1rem', fontSize: 13, color: 'var(--accent)' }}>
            ✅ Almost at your goal! Just <strong>{calRemain} kcal</strong> left.
          </div>
        )}
      </div>

      {/* Food Search */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>🔍 Log Food</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
          Enter the food and the amount — we&apos;ll calculate the macros for you automatically.
        </div>

        {/* Two inputs side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Food name</label>
            <input
              value={foodName}
              onChange={e => setFoodName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchFood()}
              placeholder="e.g. scrambled eggs, rice, brioche bread..."
            />
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Amount</label>
            <input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchFood()}
              placeholder="e.g. 2, 200g, 1 cup"
            />
          </div>
        </div>

        {/* Examples */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {[
            { food: 'Scrambled eggs', amount: '3' },
            { food: 'Brioche bread', amount: '3 slices' },
            { food: 'White rice', amount: '200g' },
            { food: 'Chicken breast', amount: '150g' },
            { food: 'Oats', amount: '80g' },
            { food: 'Banana', amount: '1' },
          ].map(ex => (
            <button key={ex.food} onClick={() => { setFoodName(ex.food); setAmount(ex.amount); }} style={{
              background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)',
              padding: '4px 10px', borderRadius: 20, fontSize: 11,
            }}>
              {ex.food} · {ex.amount}
            </button>
          ))}
        </div>

        <button onClick={searchFood} disabled={searching || !foodName.trim()} style={{
          width: '100%', background: 'var(--accent)', color: '#000',
          padding: '11px', borderRadius: 8, fontWeight: 700, fontSize: 14,
          opacity: searching || !foodName.trim() ? 0.5 : 1,
        }}>
          {searching ? `Looking up "${amount ? amount + ' ' : ''}${foodName}"...` : 'Look Up Macros'}
        </button>

        {searchError && (
          <div style={{ background: '#ff444415', border: '1px solid #ff444430', borderRadius: 8, padding: '10px', marginTop: 10, fontSize: 13, color: '#ff8888' }}>
            ⚠️ {searchError}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>Tap to add to your log:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.map((r, i) => (
                <button key={i} onClick={() => addResult(r)} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '12px 14px', textAlign: 'left',
                  color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      Protein: {r.proteinG}g · Carbs: {r.carbsG}g · Fat: {r.fatG}g
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{r.calories}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>kcal · tap to add</div>
                  </div>
                </button>
              ))}
              <button onClick={() => { setResults([]); }} style={{
                background: 'none', border: '1px dashed var(--border)', color: 'var(--muted)',
                padding: '8px', borderRadius: 8, fontSize: 12,
              }}>
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Food log */}
      <div>
        <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          {date === today() ? "Today's" : `${formatDate(date)}'s`} Log ({entries.length} items)
        </div>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: 14, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
            Nothing logged yet. Search for food above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {entries.map(e => (
              <div key={e.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{e.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    P: {e.proteinG}g · C: {e.carbsG}g · F: {e.fatG}g
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', minWidth: 70, textAlign: 'right' }}>{e.calories} kcal</div>
                <button onClick={() => remove(e.id)} style={{ background: 'none', color: 'var(--muted)', padding: '4px 8px', fontSize: 16, borderRadius: 6 }}>✕</button>
              </div>
            ))}
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
              <span>Daily Total</span>
              <span style={{ color: 'var(--accent)' }}>
                {Math.round(totals.calories)} kcal · P:{Math.round(totals.proteinG)}g · C:{Math.round(totals.carbsG)}g · F:{Math.round(totals.fatG)}g
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
