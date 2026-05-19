import { withApiSentry } from '@/lib/withApiSentry';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import Teacher from '@/models/Teacher';
import Video from '@/models/Video';
import VotingState from '@/models/VotingState';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withApiSentry(async (request: NextRequest) => {
  const session = await getSession();
  if (!session.userId || session.role !== 'teacher') {
    return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
  }

  const { ranking } = await request.json();
  if (!Array.isArray(ranking) || ranking.length !== 10) {
    return NextResponse.json({ error: 'Clasamentul trebuie să conțină exact 10 videoclipuri.' }, { status: 400 });
  }

  await connectDB();

  const votingState = await VotingState.findOne().lean();
  if (votingState?.status !== 'active') {
    return NextResponse.json({ error: 'Votarea nu este activă.' }, { status: 400 });
  }

  const teacher = await Teacher.findById(session.userId);
  if (!teacher) return NextResponse.json({ error: 'Utilizator negăsit.' }, { status: 404 });
  if (teacher.votingMethod !== 'simple') {
    return NextResponse.json({ error: 'Metodă de votare incorectă.' }, { status: 400 });
  }
  if (teacher.voteSubmitted) {
    return NextResponse.json({ error: 'Votul a fost deja trimis.' }, { status: 400 });
  }

  // Validate all video IDs exist
  const videoCount = await Video.countDocuments({ _id: { $in: ranking } });
  if (videoCount !== 10) {
    return NextResponse.json({ error: 'Unele videoclipuri nu sunt valide.' }, { status: 400 });
  }

  teacher.submittedRanking = ranking;
  teacher.voteSubmitted = true;
  await teacher.save();

  return NextResponse.json({ success: true });
});
