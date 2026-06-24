'use client';
import { useState } from 'react';
import { getUsers, saveUser, setCurrentUser } from '@/lib/storage';
import { uid } from '@/lib/macros';
import { User } from '@/lib/types';

export default function AuthPage({ onAuth }: { onAuth: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const users = getUsers();

    if (mode === 'signup') {
      if (users.find(u => u.email === email)) { setError('Email already registered.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      const user: User = { id: uid(), email, password: btoa(password), name, createdAt: new Date().toISOString() };
      saveUser(user);
      setCurrentUser(user);
      onAuth(user);
    } else {
      const user = users.find(u => u.email === email && u.password === btoa(password));
      if (!user) { setError('Invalid email or password.'); return; }
      setCurrentUser(user);
      onAuth(user);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', color: 'var(--accent)', lineHeight: 1 }}>
            MACRO<span style={{ color: 'var(--text)' }}>FORGE</span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8 }}>Track. Lift. Dominate.</p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 10, padding: 4, marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px', borderRadius: 7,
              background: mode === m ? 'var(--accent)' : 'transparent',
              color: mode === m ? '#000' : 'var(--muted)',
              fontWeight: 600, fontSize: 14, transition: 'all 0.2s'
            }}>
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, display: 'block' }}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" required />
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, display: 'block' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, display: 'block' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {error && <div style={{ background: '#ff444420', border: '1px solid #ff444440', color: '#ff6666', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{error}</div>}

          <button type="submit" style={{ background: 'var(--accent)', color: '#000', padding: '12px', marginTop: 4, fontWeight: 700, fontSize: 15, borderRadius: 8 }}>
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 13, color: 'var(--muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ background: 'none', color: 'var(--accent)', fontWeight: 600, padding: 0 }}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
