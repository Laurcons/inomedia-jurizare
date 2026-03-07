import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import VotingState from '@/models/VotingState';

export default async function TeacherPage() {
  const session = await getSession();
  await connectDB();

  const [teacher, votingState] = await Promise.all([
    Teacher.findById(session.userId).lean(),
    VotingState.findOne().lean(),
  ]);

  if (!teacher) redirect('/auth/login');

  const status = votingState?.status ?? 'not_started';

  if (status === 'not_started') {
    return (
      <div className="row justify-content-center">
        <div className="col-md-6 text-center py-5">
          <div className="card shadow-sm">
            <div className="card-body p-5">
              <h2 className="h4 mb-3">Perioada de jurizare nu a început</h2>
              <p className="text-muted">
                Revino mai târziu când organizatorii vor deschide procesul de votare.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'stopped') {
    return (
      <div className="row justify-content-center">
        <div className="col-md-6 text-center py-5">
          <div className="card shadow-sm border-warning">
            <div className="card-body p-5">
              <h2 className="h4 mb-3">Perioada de jurizare s-a încheiat</h2>
              <p className="text-muted">Voturile au fost colectate. Mulțumim pentru participare!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Voting is active
  if (!teacher.votingMethod) {
    redirect('/teacher/vote-method');
  }

  if (teacher.votingMethod === 'simple') {
    if (teacher.voteSubmitted) {
      return (
        <div className="row justify-content-center">
          <div className="col-md-6 text-center py-5">
            <div className="card shadow-sm border-success">
              <div className="card-body p-5">
                <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
                  ✓
                </div>
                <h2 className="h4 mb-3">Votul a fost trimis!</h2>
                <p className="text-muted">Clasamentul tău a fost înregistrat cu succes.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    redirect('/teacher/vote');
  }

  if (teacher.votingMethod === 'students') {
    redirect('/teacher/students');
  }

  return null;
}
