'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!email) router.replace('/auth/login');
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      if (data.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/teacher');
      }
    } catch {
      setError('Eroare de rețea. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setResendCooldown(60);
      }
    } catch {
      setError('Eroare de rețea. Încearcă din nou.');
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-sm" style={{ maxWidth: 420, width: '100%' }}>
        <div className="card-body p-4">
          <h1 className="h4 mb-1 text-center">Verificare cod</h1>
          <p className="text-muted text-center mb-4 small">
            Am trimis un cod de 6 cifre la <strong>{email}</strong>
          </p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">
                Cod de verificare
              </label>
              <input
                id="otp"
                type="text"
                className="form-control form-control-lg text-center"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                autoFocus
                placeholder="------"
                maxLength={6}
                style={{ letterSpacing: '0.5em', fontSize: '1.5rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Se verifică...
                </>
              ) : (
                'Autentifică-mă'
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              className="btn btn-link btn-sm p-0"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resendLoading}
            >
              {resendCooldown > 0
                ? `Retrimite codul (${resendCooldown}s)`
                : resendLoading
                  ? 'Se trimite...'
                  : 'Retrimite codul'}
            </button>
          </div>

          <div className="text-center mt-2">
            <a href="/auth/login" className="text-muted small text-decoration-none">
              ← Înapoi
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
