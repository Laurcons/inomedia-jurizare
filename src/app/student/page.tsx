'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentEntryPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (cleaned.length !== 6) {
      setError('Codul trebuie să aibă 6 caractere.');
      return;
    }
    setLoading(true);
    setError('');
    router.push(`/student/${cleaned}`);
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-sm" style={{ maxWidth: 400, width: '100%' }}>
        <div className="card-body p-4">
          <h1 className="h4 mb-1 text-center">Acces elevi</h1>
          <p className="text-muted text-center mb-4 small">
            Introdu codul primit de la profesorul tău.
          </p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="code" className="form-label">
                Cod de acces
              </label>
              <input
                id="code"
                type="text"
                className="form-control form-control-lg text-center text-uppercase"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                required
                autoFocus
                placeholder="XXXXXX"
                maxLength={6}
                style={{ letterSpacing: '0.4em', fontSize: '1.5rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              Continuă
            </button>
          </form>

          <div className="text-center mt-3">
            <a href="/" className="text-muted small text-decoration-none">
              ← Înapoi
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
