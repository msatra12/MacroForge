'use client';
import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { getCurrentUser, setCurrentUser } from '@/lib/storage';
import LandingPage from '@/components/LandingPage';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';

type Screen = 'landing' | 'auth' | 'app';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      setScreen('app');
    }
    setLoading(false);
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)' }}>
        MACRO<span style={{ color: 'var(--text)' }}>FORGE</span>
      </div>
    </div>
  );

  if (screen === 'landing') return (
    <LandingPage onGetStarted={() => setScreen('auth')} />
  );

  if (screen === 'auth') return (
    <AuthPage onAuth={u => { setUser(u); setScreen('app'); }} />
  );

  if (screen === 'app' && user) return (
    <Dashboard
      user={user}
      onLogout={() => { setCurrentUser(null); setUser(null); setScreen('landing'); }}
    />
  );

  return null;
}
