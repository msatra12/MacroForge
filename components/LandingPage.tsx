'use client';
import { useEffect, useRef } from 'react';

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);

  // Subtle parallax on scroll
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const s = {
    // Layout
    section: (extra?: object): React.CSSProperties => ({
      padding: '6rem 1.5rem',
      maxWidth: 1100,
      margin: '0 auto',
      ...extra,
    }),
    // Text
    eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase' as const, marginBottom: '0.75rem' },
    h2: { fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem' },
    body: { fontSize: 16, color: 'var(--muted)', lineHeight: 1.8 },
    // Cards
    featureCard: (accent: string): React.CSSProperties => ({
      background: 'var(--surface)',
      border: `1px solid var(--border)`,
      borderRadius: 16,
      padding: '1.75rem',
      position: 'relative',
      overflow: 'hidden',
    }),
    accentLine: (color: string): React.CSSProperties => ({
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: 3,
      background: color,
      borderRadius: '16px 16px 0 0',
    }),
  };

  const features = [
    {
      icon: '🥗',
      title: 'Smart Macro Tracking',
      desc: 'Tell MacroForge your goal — bulk, cut, or recomp — and it calculates your exact daily calories, protein, carbs, and fat using your body stats and activity level.',
      color: 'var(--accent)',
      stat: '2,847',
      statLabel: 'avg kcal for bulkers',
    },
    {
      icon: '🏋️',
      title: 'Workout Logger',
      desc: 'Log every set, rep, and weight for strength and cardio. Track hybrid sessions if you lift and run. Your effort is recorded every single session.',
      color: '#00aaff',
      stat: '3×',
      statLabel: 'weekly recommended',
    },
    {
      icon: '🏆',
      title: 'Personal Records',
      desc: "The app automatically detects when you've hit a new PR. Squat more than last week? It knows. Your 1-rep max is estimated so you can see how strong you're becoming.",
      color: '#ff8800',
      stat: '↑',
      statLabel: 'every week you show up',
    },
    {
      icon: '⚡',
      title: 'Built for Hybrid Athletes',
      desc: "Whether you're a runner who lifts, a lifter who runs, or purely one or the other — MacroForge tracks it all in one place. No separate apps.",
      color: '#cc44ff',
      stat: '1',
      statLabel: 'app for everything',
    },
  ];

  const steps = [
    { n: '01', title: 'Create your account', desc: 'Sign up in seconds. No credit card, no nonsense.' },
    { n: '02', title: 'Set up your profile', desc: 'Enter your stats and goal. We calculate everything else — calories, macros, the lot.' },
    { n: '03', title: 'Log your food & training', desc: 'Add meals, log workouts, and track every set you do. Quick-add presets make it fast.' },
    { n: '04', title: 'Watch yourself get stronger', desc: 'Hit a new PR? MacroForge tells you. Your progress is visualized session by session.' },
  ];

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', color: 'var(--accent)' }}>
          MACRO<span style={{ color: 'var(--text)' }}>FORGE</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="#features" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>Features</a>
          <a href="#how" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>How it works</a>
          <button onClick={onGetStarted} style={{
            background: 'var(--accent)', color: '#000', padding: '8px 18px',
            borderRadius: 8, fontWeight: 700, fontSize: 13,
          }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: 60 }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(200,255,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,255,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />

        {/* Glow orbs */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%)', top: '10%', left: '60%', transform: 'translate(-50%, -50%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,170,255,0.05) 0%, transparent 70%)', bottom: '10%', left: '20%', zIndex: 0 }} />

        <div ref={heroRef} style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem 1.5rem', maxWidth: 820 }}>
          <div style={{ ...s.eyebrow, marginBottom: '1.25rem' }}>
            For hybrid athletes & gym beginners alike
          </div>

          <h1 style={{
            fontSize: 'clamp(42px, 9vw, 88px)',
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: '-2px',
            marginBottom: '1.5rem',
          }}>
            TRACK.<br />
            <span style={{ color: 'var(--accent)' }}>LIFT.</span><br />
            DOMINATE.
          </h1>

          <p style={{ ...s.body, fontSize: 18, maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            MacroForge is the all-in-one tracker for people who are serious about getting stronger. Log your food, hit your macros, track every workout, and watch your personal records fall.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onGetStarted} style={{
              background: 'var(--accent)', color: '#000',
              padding: '15px 36px', borderRadius: 10, fontWeight: 800, fontSize: 16,
              letterSpacing: '0.02em',
            }}>
              Start for Free →
            </button>
            <a href="#features" style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text)', padding: '15px 28px', borderRadius: 10,
              fontWeight: 600, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
            }}>
              See how it works
            </a>
          </div>

          {/* Social proof strip */}
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
            {[['🔥', 'Calorie & macro tracking'], ['🏋️', 'Workout logging'], ['🏆', 'Auto PR detection'], ['⚡', 'Hybrid athlete ready']].map(([icon, label]) => (
              <div key={label} style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS BANNER ── */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {[
            { val: '100%', label: 'Free to use', sub: 'No subscription required' },
            { val: '3×/wk', label: 'Full body training', sub: 'Optimal for beginners' },
            { val: '1RM', label: 'Estimated automatically', sub: 'From every working set' },
            { val: '∞', label: 'Workouts tracked', sub: 'No limits, ever' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 38, fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginTop: 8 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div id="features" style={s.section()}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={s.eyebrow}>Everything you need</div>
          <h2 style={s.h2}>Built for results,<br />not excuses.</h2>
          <p style={{ ...s.body, maxWidth: 480, margin: '0 auto' }}>Four core pillars that work together to keep you on track, every single day.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {features.map(f => (
            <div key={f.title} style={s.featureCard(f.color)}>
              <div style={s.accentLine(f.color)} />
              <div style={{ fontSize: 32, marginBottom: '1rem', marginTop: 4 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: '0.75rem' }}>{f.title}</h3>
              <p style={{ ...s.body, fontSize: 14 }}>{f.desc}</p>
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: f.color }}>{f.stat}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{f.statLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div id="how" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={s.section()}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={s.eyebrow}>Simple by design</div>
            <h2 style={s.h2}>From zero to tracking<br />in under 3 minutes.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {steps.map((step, i) => (
              <div key={step.n} style={{ position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: 20, left: 'calc(50% + 32px)', right: '-50%', height: 1, background: 'var(--border)', display: window?.innerWidth > 600 ? 'block' : 'none' }} />
                )}
                <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: '1.5rem', border: '1px solid var(--border)', height: '100%' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>{step.n}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: '0.5rem' }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOR HYBRID ATHLETES ── */}
      <div style={s.section()}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={s.eyebrow}>Designed for people like you</div>
            <h2 style={{ ...s.h2, fontSize: 'clamp(24px, 4vw, 40px)' }}>Lifting 3 days.<br />Running 3 days.<br />Dominating all 7.</h2>
            <p style={{ ...s.body, marginBottom: '1.5rem' }}>
              MacroForge was built with the hybrid athlete in mind. If you&apos;re 77kg, skinny fat, and ready to build real muscle while staying conditioned — this is your app.
            </p>
            <p style={{ ...s.body, marginBottom: '2rem' }}>
              Log your fullbody lifts. Track your runs. Hit your bulk macros. See your compound lifts go up week after week. That&apos;s the plan. MacroForge keeps score.
            </p>
            <button onClick={onGetStarted} style={{
              background: 'var(--accent)', color: '#000',
              padding: '13px 28px', borderRadius: 10, fontWeight: 800, fontSize: 15,
            }}>
              Start your bulk →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { day: 'Mon', label: 'Fullbody Strength', type: 'strength', exercises: 'Squat · Bench · Row' },
              { day: 'Tue', label: '5K Easy Run', type: 'cardio', exercises: '5.0 km · Zone 2' },
              { day: 'Wed', label: 'Fullbody Strength', type: 'strength', exercises: 'Deadlift · OHP · Pull-up' },
              { day: 'Thu', label: 'Tempo Run', type: 'cardio', exercises: '4.0 km · Zone 3–4' },
              { day: 'Fri', label: 'Fullbody Strength', type: 'strength', exercises: 'Squat · Incline · Row' },
              { day: 'Sat', label: 'Long Run', type: 'cardio', exercises: '8.0 km · Easy pace' },
            ].map((row) => (
              <div key={row.day} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: row.type === 'strength' ? '#c8ff0015' : '#00aaff15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {row.type === 'strength' ? '🏋️' : '🏃'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{row.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{row.exercises}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: row.type === 'strength' ? 'var(--accent)' : '#00aaff' }}>{row.day}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center' }}>
          <div style={s.eyebrow}>Free. Always.</div>
          <h2 style={{ ...s.h2, fontSize: 'clamp(32px, 6vw, 60px)' }}>
            Your transformation<br />starts <span style={{ color: 'var(--accent)' }}>right now.</span>
          </h2>
          <p style={{ ...s.body, maxWidth: 440, margin: '0 auto 2.5rem', fontSize: 17 }}>
            No excuses. No subscriptions. Just you, the bar, and a tracker that keeps you honest.
          </p>
          <button onClick={onGetStarted} style={{
            background: 'var(--accent)', color: '#000',
            padding: '16px 48px', borderRadius: 10, fontWeight: 900, fontSize: 18,
            letterSpacing: '0.02em',
          }}>
            Create Your Account →
          </button>
          <div style={{ marginTop: '1.5rem', fontSize: 12, color: 'var(--muted)' }}>
            Free forever · No credit card · Takes 2 minutes
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent)', marginBottom: 8 }}>
          MACRO<span style={{ color: 'var(--text)' }}>FORGE</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Track. Lift. Dominate. · Built for hybrid athletes.</div>
      </footer>

    </div>
  );
}
