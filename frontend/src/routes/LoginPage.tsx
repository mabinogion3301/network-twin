import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api/auth.api';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const [email, setEmail] = useState('admin@telebras.local');
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
      navigate('/topology');
    } catch {
      setError('Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <form onSubmit={handleSubmit} style={{ background: '#1e293b', padding: 32, borderRadius: 12, width: 340 }}>
        <h2 style={{ color: '#e2e8f0', marginBottom: 24 }}>Network Twin</h2>
        <label style={labelStyle}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} type="email" required />
        <label style={labelStyle}>Senha</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} type="password" required />
        {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = { color: '#94a3b8', fontSize: 12, display: 'block', marginTop: 12, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: 10, borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' };
const buttonStyle: React.CSSProperties = { width: '100%', marginTop: 20, padding: 10, borderRadius: 6, border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: 'pointer' };
