'use client';

import { useState, FormEvent } from 'react';
import VotingInterface from '@/components/VotingInterface';
import type { VideoItem } from '@/components/VotingInterface';

interface Props {
  teacherId: string;
  code: string;
  videos: VideoItem[];
}

type Step = 'identify' | 'vote' | 'success';

export default function StudentVotingClient({ teacherId, code, videos }: Props) {
  const [step, setStep] = useState<Step>('identify');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [formError, setFormError] = useState('');

  function handleIdentify(e: FormEvent) {
    e.preventDefault();
    if (!studentName.trim() || !studentClass.trim()) {
      setFormError('Completează toate câmpurile.');
      return;
    }
    setFormError('');
    setStep('vote');
  }

  function handleCastSuccess() {
    setStep('success');
  }

  function handleAnotherVote() {
    setStudentName('');
    setStudentClass('');
    setStep('identify');
  }

  if (step === 'success') {
    return (
      <div className="text-center py-5">
        <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
          ✓
        </div>
        <h2 className="h4 mb-2">Votul a fost trimis!</h2>
        <p className="text-muted mb-4">Mulțumim pentru participare, {studentName}!</p>
        <button className="btn btn-outline-primary" onClick={handleAnotherVote}>
          Alt elev votează
        </button>
      </div>
    );
  }

  if (step === 'identify') {
    return (
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 mb-1">Bun venit!</h2>
              <p className="text-muted mb-4 small">
                Introdu datele tale pentru a continua cu votarea.
              </p>

              {formError && <div className="alert alert-danger py-2">{formError}</div>}

              <form onSubmit={handleIdentify}>
                <div className="mb-3">
                  <label className="form-label">Prenume și nume</label>
                  <input
                    type="text"
                    className="form-control"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    autoFocus
                    placeholder="ex. Ionescu Maria"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Clasă</label>
                  <input
                    type="text"
                    className="form-control"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    required
                    placeholder="ex. IX A"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Continuă
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vote step
  return (
    <div>
      <div className="mb-3">
        <h2 className="h5 mb-0">Votul tău, {studentName}</h2>
        <p className="text-muted small">
          Ordonează videoclipurile pentru a crea clasamentul tău top 10.
        </p>
      </div>
      <VotingInterface
        rankedVideos={videos.slice(0, 10)}
        unrankedVideos={videos.slice(10)}
        castUrl="/api/student/vote"
        castRedirect="/"
        studentData={{ studentName, studentClass, code }}
        onCastSuccess={handleCastSuccess}
      />
    </div>
  );
}
