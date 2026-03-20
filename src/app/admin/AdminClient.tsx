'use client';

import type { VotingStatus } from '@/models/VotingState';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface TeacherRow {
  id: string;
  fullName: string;
  school: string;
  locality: string;
  county: string;
  votingMethod: 'simple' | 'students' | null;
  voteSubmitted: boolean;
  studentVoteCount: number;
}

interface RankingEntry {
  videoId: string;
  score: number;
  title: string;
}

interface Props {
  status: VotingStatus;
  teachers: TeacherRow[];
  nationalRanking: RankingEntry[];
}

export default function AdminClient({ status, teachers, nationalRanking }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<'start' | 'stop' | null>(null);
  const [error, setError] = useState('');

  async function handleStart() {
    setLoading('start');
    setError('');
    try {
      const res = await fetch('/api/admin/voting/start', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) setError(data.error);
      else router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleStop() {
    if (!confirm('Ești sigur că vrei să oprești votarea? Această acțiune nu poate fi anulată.')) return;
    setLoading('stop');
    setError('');
    try {
      const res = await fetch('/api/admin/voting/stop', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) setError(data.error);
      else router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const votingMethodLabel = (method: TeacherRow['votingMethod']) => {
    if (!method) return <span className="text-muted">–</span>;
    return method === 'simple' ? 'Simplă' : 'Cu elevi';
  };

  if (status === 'not_started') {
    return (
      <div className="row justify-content-center">
        <div className="col-md-6 text-center py-5">
          <div className="card shadow-sm">
            <div className="card-body p-5">
              <h2 className="h4 mb-3">Jurizarea nu a început</h2>
              <p className="text-muted mb-4">Apasă butonul de mai jos pentru a deschide perioada de jurizare.</p>
              {error && <div className="alert alert-danger">{error}</div>}
              <button className="btn btn-success btn-lg" onClick={handleStart} disabled={loading === 'start'}>
                {loading === 'start' ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Se pornește...
                  </>
                ) : (
                  'Pornește jurizarea'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="h4 mb-0">Panou de administrare</h2>
          <span className={`badge ${status === 'active' ? 'bg-success' : 'bg-secondary'} mt-1`}>
            {status === 'active' ? 'Jurizare activă' : 'Jurizare încheiată'}
          </span>
        </div>
        {status === 'active' && (
          <button className="btn btn-outline-danger" onClick={handleStop} disabled={loading === 'stop'}>
            {loading === 'stop' ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Se oprește...
              </>
            ) : (
              'Oprește jurizarea'
            )}
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {/* National ranking */}
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header fw-semibold">Clasament național curent</div>
            <div className="card-body p-0">
              {nationalRanking.length === 0 ? (
                <p className="text-muted p-3 mb-0 small">Nu există voturi finalizate încă.</p>
              ) : (
                <ol className="list-group list-group-flush list-group-numbered">
                  {nationalRanking.map((entry) => (
                    <li
                      key={entry.videoId}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span className="small">{entry.title}</span>
                      <span className="badge bg-primary rounded-pill ms-2">{entry.score} pt</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* Teachers list */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header fw-semibold">
              Profesori ({teachers.filter((t) => t.voteSubmitted).length}/{teachers.length} au votat)
            </div>
            <div className="table-responsive">
              <table className="table table-hover table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Profesor</th>
                    <th>Școală</th>
                    <th>Localitate / Județ</th>
                    <th>Metodă</th>
                    <th>Votat</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.id}>
                      <td className="small">{t.fullName}</td>
                      <td className="small">{t.school}</td>
                      <td className="small text-muted">
                        {t.locality}, {t.county}
                      </td>
                      <td className="small">
                        {votingMethodLabel(t.votingMethod)}
                        {t.votingMethod === 'students' && (
                          <span className="text-muted ms-1">({t.studentVoteCount} elevi)</span>
                        )}
                      </td>
                      <td>
                        {t.voteSubmitted ? (
                          <span className="badge bg-success">Da</span>
                        ) : (
                          <span className="badge bg-light text-muted">Nu</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
