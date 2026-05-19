'use client';

import { apiFetch } from '@/lib/apiFetch';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function VoteMethodForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<'simple' | 'students' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/teacher/vote-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      router.push('/teacher');
    } catch {
      setError('Eroare de rețea. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div
            className={`card h-100 cursor-pointer ${selected === 'simple' ? 'border-primary border-2' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setSelected('simple')}
          >
            <div className="card-body">
              <div className="d-flex align-items-start gap-2">
                <input
                  type="radio"
                  className="form-check-input mt-1"
                  checked={selected === 'simple'}
                  onChange={() => setSelected('simple')}
                />
                <div>
                  <h5 className="card-title mb-1">Jurizare Simplă</h5>
                  <p className="card-text text-muted small">
                    Tu, ca profesor, realizezi personal clasamentul top 10 al videoclipurilor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div
            className={`card h-100 cursor-pointer ${selected === 'students' ? 'border-primary border-2' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setSelected('students')}
          >
            <div className="card-body">
              <div className="d-flex align-items-start gap-2">
                <input
                  type="radio"
                  className="form-check-input mt-1"
                  checked={selected === 'students'}
                  onChange={() => setSelected('students')}
                />
                <div>
                  <h5 className="card-title mb-1">Jurizare cu Elevi</h5>
                  <p className="card-text text-muted small">
                    Elevii tăi votează individual, iar voturile lor sunt agregate în clasamentul școlii.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-primary" onClick={handleConfirm} disabled={!selected || loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Se salvează...
            </>
          ) : (
            'Confirmă alegerea'
          )}
        </button>
        <a href="/tutorial" className="text-muted small text-decoration-none">
          Am nevoie de ajutor
        </a>
      </div>
    </div>
  );
}
