'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

const QRCodeSVG = dynamic(() => import('qrcode.react').then((m) => m.QRCodeSVG), { ssr: false });

interface VoteItem {
  id: string;
  studentName: string;
  studentClass: string;
  removed: boolean;
  createdAt: string;
}

interface RankingVideo {
  id: string;
  title: string;
}

interface Props {
  teacher: { id: string; joinCode: string; voteSubmitted: boolean };
  votes: VoteItem[];
  rankingVideos: RankingVideo[];
  isActive: boolean;
  isStopped: boolean;
  baseUrl: string;
}

export default function StudentsClient({
  teacher,
  votes: initialVotes,
  rankingVideos: initialRanking,
  isActive,
  isStopped,
  baseUrl,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'instructions' | 'votes' | 'ranking'>('instructions');
  const [votes, setVotes] = useState<VoteItem[]>(initialVotes);
  const [rankingVideos, setRankingVideos] = useState<RankingVideo[]>(initialRanking);
  const [joinCode, setJoinCode] = useState(teacher.joinCode);
  const [submitted, setSubmitted] = useState(teacher.voteSubmitted);

  const [refreshingVotes, setRefreshingVotes] = useState(false);
  const [refreshingRanking, setRefreshingRanking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const directUrl = `${baseUrl}/student/${joinCode}`;

  const refreshVotes = useCallback(async () => {
    setRefreshingVotes(true);
    try {
      const res = await fetch('/api/teacher/students/votes');
      if (res.ok) {
        const data = await res.json();
        setVotes(data.votes);
      }
    } finally {
      setRefreshingVotes(false);
    }
  }, []);

  const refreshRanking = useCallback(async () => {
    setRefreshingRanking(true);
    try {
      const res = await fetch('/api/teacher/ranking');
      if (res.ok) {
        const data = await res.json();
        setRankingVideos(data.ranking);
      }
    } finally {
      setRefreshingRanking(false);
    }
  }, []);

  async function toggleRemove(voteId: string) {
    const res = await fetch(`/api/teacher/students/votes/${voteId}`, { method: 'PATCH' });
    if (res.ok) {
      setVotes((prev) => prev.map((v) => (v.id === voteId ? { ...v, removed: !v.removed } : v)));
    }
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await fetch('/api/teacher/code/regenerate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setJoinCode(data.code);
        setShowRegenerateModal(false);
      }
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/teacher/students/submit', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error);
      } else {
        setSubmitted(true);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-6 text-center py-5">
          <div className="card shadow-sm border-success">
            <div className="card-body p-5">
              <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
                ✓
              </div>
              <h2 className="h4 mb-3">Voturile au fost trimise!</h2>
              <p className="text-muted">Clasamentul elevilor tăi a fost înregistrat cu succes.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="h4 mb-1">Jurizare cu Elevi</h2>
      {isStopped && <div className="alert alert-warning">Perioada de jurizare s-a încheiat.</div>}

      <ul className="nav nav-tabs mb-4 mt-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'instructions' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructions')}
          >
            Instrucțiuni
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'votes' ? 'active' : ''}`} onClick={() => setActiveTab('votes')}>
            Voturi primite <span className="badge bg-secondary ms-1">{votes.filter((v) => !v.removed).length}</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ranking' ? 'active' : ''}`}
            onClick={() => setActiveTab('ranking')}
          >
            Clasament curent
          </button>
        </li>
      </ul>

      {activeTab === 'instructions' && (
        <div className="row g-4">
          <div className="col-md-7">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Cod de acces pentru elevi</h5>
                <p className="text-muted small mb-3">
                  Transmite codul sau link-ul direct elevilor tăi. Ei pot accesa platforma și vota independent.
                </p>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Cod</label>
                  <div className="d-flex align-items-center gap-2">
                    <code className="fs-3 fw-bold bg-light px-3 py-2 rounded" style={{ letterSpacing: '0.3em' }}>
                      {joinCode}
                    </code>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setShowRegenerateModal(true)}
                      disabled={!isActive}
                    >
                      Regenerează
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Link direct</label>
                  <div className="input-group">
                    <input type="text" className="form-control font-monospace small" value={directUrl} readOnly />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => navigator.clipboard.writeText(directUrl)}
                      title="Copiază link-ul"
                    >
                      Copiază
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-5 d-flex flex-column align-items-center">
            <p className="fw-semibold mb-2">Cod QR</p>
            <QRCodeSVG value={directUrl} size={180} />
            <p className="text-muted small mt-2 text-center">{directUrl}</p>
          </div>
        </div>
      )}

      {activeTab === 'votes' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted small">
              {votes.filter((v) => !v.removed).length} voturi active din {votes.length} total
            </span>
            <button className="btn btn-outline-secondary btn-sm" onClick={refreshVotes} disabled={refreshingVotes}>
              {refreshingVotes ? <span className="spinner-border spinner-border-sm" /> : 'Reîncarcă'}
            </button>
          </div>

          {votes.length === 0 ? (
            <div className="alert alert-info">Niciun vot primit încă.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Elev</th>
                    <th>Clasă</th>
                    <th>Trimis la</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((vote) => (
                    <tr key={vote.id} className={vote.removed ? 'text-muted' : ''}>
                      <td>
                        <span style={{ textDecoration: vote.removed ? 'line-through' : 'none' }}>
                          {vote.studentName}
                        </span>
                      </td>
                      <td>
                        <span style={{ textDecoration: vote.removed ? 'line-through' : 'none' }}>
                          {vote.studentClass}
                        </span>
                      </td>
                      <td className="small text-muted">{new Date(vote.createdAt).toLocaleString('ro-RO')}</td>
                      <td>
                        {isActive && (
                          <button
                            className={`btn btn-sm ${vote.removed ? 'btn-outline-success' : 'btn-outline-danger'}`}
                            onClick={() => toggleRemove(vote.id)}
                          >
                            {vote.removed ? 'Anulează ștergerea' : 'Elimină'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isActive && (
            <div className="mt-4 pt-3 border-top">
              {submitError && <div className="alert alert-danger">{submitError}</div>}
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={submitting || votes.filter((v) => !v.removed).length === 0}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Se trimite...
                  </>
                ) : (
                  'Trimite voturile elevilor'
                )}
              </button>
              <p className="text-muted small mt-2">Apasă acest buton când toți elevii tăi au votat.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ranking' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted small">Bazat pe voturile active ale elevilor tăi</span>
            <button className="btn btn-outline-secondary btn-sm" onClick={refreshRanking} disabled={refreshingRanking}>
              {refreshingRanking ? <span className="spinner-border spinner-border-sm" /> : 'Reîncarcă'}
            </button>
          </div>

          {rankingVideos.length === 0 ? (
            <div className="alert alert-info">
              Niciun vot primit încă. Clasamentul va apărea după ce elevii votează.
            </div>
          ) : (
            <ol className="list-group list-group-numbered">
              {rankingVideos.map((v) => (
                <li key={v.id} className="list-group-item">
                  {v.title}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Regenerate modal */}
      {showRegenerateModal && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Regenerează codul de acces</h5>
                <button className="btn-close" onClick={() => setShowRegenerateModal(false)} />
              </div>
              <div className="modal-body">
                <p>
                  Ești sigur că vrei să generezi un cod nou? Voturile existente vor fi păstrate, dar codul vechi{' '}
                  <strong>{joinCode}</strong> nu va mai fi acceptat pentru voturi noi.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRegenerateModal(false)}>
                  Anulează
                </button>
                <button className="btn btn-danger" onClick={handleRegenerate} disabled={regenerating}>
                  {regenerating ? 'Se generează...' : 'Generează cod nou'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
