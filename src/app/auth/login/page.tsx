'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch {
      setError('Eroare de rețea. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-sm" style={{ maxWidth: 420, width: '100%' }}>
        <div className="card-body p-4">
          <h1 className="h4 mb-1 text-center">Autentificare</h1>
          <p className="text-muted text-center mb-4 small">
            Introdu adresa de email pentru a primi codul de verificare.
          </p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Adresă de email
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="exemplu@scoala.ro"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Se trimite...
                </>
              ) : (
                'Trimite codul'
              )}
            </button>
          </form>

          <hr className="my-3" />
          <p className="text-center mb-1">
            <a href="/student" className="text-decoration-none">
              Sunt elev →
            </a>
          </p>
          <p className="text-center mb-0">
            <a href="/tutorial" className="text-muted small text-decoration-none">
              Am nevoie de ajutor
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
