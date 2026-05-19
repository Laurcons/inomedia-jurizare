import { withApiSentry } from '@/lib/withApiSentry';
import { aggregateRankings } from '@/lib/borda';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import StudentVote from '@/models/StudentVote';
import Teacher from '@/models/Teacher';
import Video from '@/models/Video';
import VotingState from '@/models/VotingState';
import { NextResponse } from 'next/server';

export const POST = withApiSentry(async () => {
  const session = await getSession();
  if (!session.userId || session.role !== 'teacher') {
    return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
  }

  await connectDB();

  const votingState = await VotingState.findOne().lean();
  if (votingState?.status !== 'active') {
    return NextResponse.json({ error: 'Votarea nu este activă.' }, { status: 400 });
  }

  const teacher = await Teacher.findById(session.userId);
  if (!teacher) return NextResponse.json({ error: 'Utilizator negăsit.' }, { status: 404 });
  if (teacher.votingMethod !== 'students') {
    return NextResponse.json({ error: 'Metodă de votare incorectă.' }, { status: 400 });
  }
  if (teacher.voteSubmitted) {
    return NextResponse.json({ error: 'Votul a fost deja trimis.' }, { status: 400 });
  }

  const activeVotes = await StudentVote.find({
    teacherId: teacher._id,
    removed: false,
  }).lean();

  if (activeVotes.length === 0) {
    return NextResponse.json({ error: 'Nu există voturi active de trimis.' }, { status: 400 });
  }

  const rankings = activeVotes.map((v) => v.ranking.map((id) => id.toString()));
  const schoolRanking = aggregateRankings(rankings);

  if (schoolRanking.length < 10) {
    // Verify we have enough videos in the aggregate
    const totalVideos = await Video.countDocuments();
    if (totalVideos >= 10 && schoolRanking.length < 10) {
      return NextResponse.json(
        { error: 'Nu există suficiente voturi pentru a crea un clasament top 10.' },
        { status: 400 },
      );
    }
  }

  teacher.submittedRanking = schoolRanking as unknown as typeof teacher.submittedRanking;
  teacher.voteSubmitted = true;
  await teacher.save();

  return NextResponse.json({ success: true });
});
