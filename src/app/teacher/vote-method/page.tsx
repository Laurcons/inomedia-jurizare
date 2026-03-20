import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import Teacher from '@/models/Teacher';
import VotingState from '@/models/VotingState';
import { redirect } from 'next/navigation';
import VoteMethodForm from './VoteMethodForm';

export default async function VoteMethodPage() {
  const session = await getSession();
  await connectDB();

  const [teacher, votingState] = await Promise.all([
    Teacher.findById(session.userId).lean(),
    VotingState.findOne().lean(),
  ]);

  if (!teacher) redirect('/auth/login');
  if (votingState?.status !== 'active') redirect('/teacher');
  if (teacher.votingMethod) redirect('/teacher');

  return (
    <div className="row justify-content-center">
      <div className="col-md-7">
        <h2 className="h4 mb-1">Alege metoda de jurizare</h2>
        <p className="text-muted mb-4">Această alegere nu poate fi modificată ulterior.</p>
        <VoteMethodForm />
      </div>
    </div>
  );
}
