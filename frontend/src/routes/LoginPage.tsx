import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api/auth.api';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { accessToken, refreshToken } = await authApi.login({ email, password });
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setAuthenticated(true);
      navigate('/dashboard');
    } catch {
      setError('E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: 'flex', height: '100vh',
      background: 'var(--bg-base)',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Grade decorativa de fundo */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        opacity: 0.4,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '40px 36px',
        width: 360,
        boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 12px' }}>
            <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="4" fill="#3b82f6"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
            NETWORK TWIN
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            TELEBRAS · NOC
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.05em' }}>
              E-MAIL
            </label>
            <input
              type="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'var(--bg-base)', color: 'var(--text-primary)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                fontSize: 14, outline: 'none', fontFamily: 'var(--font-ui)',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.05em' }}>
              SENHA
            </label>
            <input
              type="password" required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'var(--bg-base)', color: 'var(--text-primary)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                fontSize: 14, outline: 'none', fontFamily: 'var(--font-ui)',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius)', padding: '9px 12px',
              color: 'var(--red)', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              marginTop: 4, padding: '11px',
              background: loading ? 'var(--accent-dim)' : 'var(--accent)',
              border: 'none', borderRadius: 'var(--radius)',
              color: '#fff', fontWeight: 600, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
