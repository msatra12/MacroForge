'use client';
import { useState, useEffect, useRef } from 'react';
import { MacroTargets, FoodEntry, Profile } from '@/lib/types';
import { getFoodEntries, saveFoodEntry, deleteFoodEntry, getAllFoodEntries } from '@/lib/storage';
import { uid, today, formatDate } from '@/lib/macros';

interface Props { userId: string; targets: MacroTargets; profile: Profile; }

interface FoodResult {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export default function CalorieTracker({ userId, targets, profile }: Props) {
  const [date, setDate] = useState(today());
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FoodResult[]>([]);
  const [searchError, setSearchError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [allEntries, setAllEntries] = useState<FoodEntry[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setEntries(getFoodEntries(userId, date)); }, [userId, date]);

  const totals = entries.reduce((a, e) => ({
    calories: a.calories + e.calories,
    proteinG: a.proteinG + e.proteinG,
    carbsG: a.carbsG + e.carbsG,
    fatG: a.fatG + e.fatG,
  }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });

  async function searchFood() {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setSearchError('');
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Give me the nutritional info for: "${query}"
Return ONLY a JSON array, no markdown, no explanation. Each item:
{"name": "food name with portion", "calories": number, "proteinG": number, "carbsG": number, "fatG": number}

Rules:
- If portion is specified use that, otherwise use a standard serving
- If it's a meal with multiple items (like "3 eggs and 2 toast"), return each item separately
- Round all numbers to nearest integer
- Return 1-4 results max`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed: FoodResult[] = JSON.parse(clean);
      setResults(parsed);
    } catch {
      setSearchError('Could not look up that food. Try being more specific (e.g. "2 scrambled eggs").');
    } finally {
      setSearching(false);
    }
  }

  function addResult(r: FoodResult) {
    const entry: FoodEntry = {
      id: uid(), userId, date,
      name: r.name,
      calories: r.calories,
      proteinG: r.proteinG,
      carbsG: r.carbsG,
      fatG: r.fatG,
      createdAt: new Date().toISOString(),
    };
    saveFoodEntry(entry);
    setEntries(getFoodEntries(userId, date));
    setResults([]);
    setQuery('');
  }

  function remove(id: string) {
    deleteFoodEntry(id);
    setEntries(getFoodEntries(userId, date));
  }

  function changeDate(delta: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    const nd = d.toISOString().split('T')[0];
    if (nd <= today()) { setDate(nd); setResults([]); setQuery(''); }
  }

  function openHistory() {
    setAllEntries(getAllFoodEntries(userId));
    setShowHistory(true);
  }

  // Group history by date
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

  // History modal
  if (showHistory) return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button onClick={() => setShowHistory(false)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px', borderRadius: 8 }}>← Back</button>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Food History</div>
      </div>
      {Object.keys(historyByDate).sort((a,b) => b.localeCompare(a)).map(d => {
        const dayEntries = historyByDate[d];
        const dayTotal = dayEntries.reduce((a, e) => a + e.calories, 0);
        return (
          <div key={d} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>{d === today() ? 'Today' : formatDate(d)}</div>
              <div style={{ color: 'var(--accent)', fontWeight: 700 }}>{dayTotal} kcal</div>
            </div>
            {dayEntries.map(e => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted)' }}>{e.name}</span>
                <span>{e.calories} kcal · P:{e.proteinG}g C:{e.carbsG}g F:{e.fatG}g</span>
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
                style={{ transition: 'stroke-dashoffset 0.5s' }}
              />
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
        {calOver ? (
          <div style={{ background: '#ff444415', border: '1px solid #ff444430', borderRadius: 8, padding: '10px 14px', marginTop: '1rem', fontSize: 13, color: '#ff8888' }}>
            ⚠️ You&apos;ve exceeded your {profile.goal} goal by <strong>{Math.abs(calRemain)} kcal</strong>. Consider lighter meals for the rest of the day.
          </div>
        ) : calRemain < 150 && totals.calories > 0 ? (
          <div style={{ background: '#c8ff0010', border: '1px solid #c8ff0030', borderRadius: 8, padding: '10px 14px', marginTop: '1rem', fontSize: 13, color: 'var(--accent)' }}>
            ✅ Almost at your goal! Just <strong>{calRemain} kcal</strong> left.
          </div>
        ) : null}
      </div>

      {/* AI Food Search */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          🔍 Search Food — just type what you ate
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
          Type any food or meal — e.g. &quot;3 eggs and 3 slices brioche bread&quot; or &quot;Big Mac&quot; or &quot;chicken rice broccoli&quot;
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchFood()}
            placeholder="e.g. 3 eggs and 3 slices brioche bread..."
            style={{ flex: 1 }}
          />
          <button onClick={searchFood} disabled={searching || !query.trim()} style={{
            background: 'var(--accent)', color: '#000', padding: '0 20px',
            borderRadius: 8, fontWeight: 700, fontSize: 14,
            opacity: searching || !query.trim() ? 0.5 : 1,
            whiteSpace: 'nowrap',
          }}>
            {searching ? '...' : 'Look up'}
          </button>
        </div>

        {searching && (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--muted)', fontSize: 13 }}>
            Looking up macros for &quot;{query}&quot;...
          </div>
        )}

        {searchError && (
          <div style={{ background: '#ff444415', border: '1px solid #ff444430', borderRadius: 8, padding: '10px', marginTop: 10, fontSize: 13, color: '#ff8888' }}>
            {searchError}
          </div>
        )}

        {results.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Tap to add to your log:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.map((r, i) => (
                <button key={i} onClick={() => addResult(r)} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '12px 14px', textAlign: 'left',
                  color: 'var(--text)', transition: 'border-color 0.2s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      P: {r.proteinG}g · C: {r.carbsG}g · F: {r.fatG}g
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{r.calories}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>kcal</div>
                  </div>
                </button>
              ))}
              <button onClick={() => { setResults([]); setQuery(''); }} style={{
                background: 'none', border: '1px dashed var(--border)', color: 'var(--muted)',
                padding: '8px', borderRadius: 8, fontSize: 12,
              }}>
                Clear results
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Food log */}
      <div>
        <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          {date === today() ? "Today's" : formatDate(date) + "'s"} Log ({entries.length} items)
        </div>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: 14, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
            Nothing logged yet. Search for food above to get started!
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
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', minWidth: 60, textAlign: 'right' }}>{e.calories} kcal</div>
                <button onClick={() => remove(e.id)} style={{ background: 'none', color: 'var(--muted)', padding: '4px 8px', fontSize: 16, borderRadius: 6 }}>✕</button>
              </div>
            ))}
            {/* Day totals */}
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
