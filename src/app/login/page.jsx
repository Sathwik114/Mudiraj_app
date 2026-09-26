'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials.');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Unable to connect to authentication server.');
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <Header />

      <main
        className="main-content"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 20px',
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: '440px',
            width: '100%',
            borderTop: '4px solid var(--primary)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
              }}
            >
              <ShieldCheck size={30} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-dark)' }}>
              Administrator Portal Login
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Restricted to authorized Mudiraj Community Administrators only.
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Admin Username or Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="username"
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or admin@mudiraj.org"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '4px' }}
            >
              <Lock size={16} /> {loading ? 'Signing In...' : 'Sign In to Admin Dashboard'}
            </button>
          </form>

          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              background: 'var(--bg-muted)',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '4px' }}>
              <User size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Default Local Development Admin Credentials:
            </div>
            <div>
              Username: <code>admin</code> (or <code>admin@mudiraj.org</code>)
            </div>
            <div>
              Password: <code>Admin@123</code>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
            <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
