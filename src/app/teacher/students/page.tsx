import { aggregateRankings } from '@/lib/borda';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import StudentVote from '@/models/StudentVote';
import Teacher from '@/models/Teacher';
import Video from '@/models/Video';
import VotingState from '@/models/VotingState';
import { redirect } from 'next/navigation';
import StudentsClient from './StudentsClient';

export default async function TeacherStudentsPage() {
  const session = await getSession();
  await connectDB();

  const [teacher, votingState] = await Promise.all([
    Teacher.findById(session.userId).lean(),
    VotingState.findOne().lean(),
  ]);

  if (!teacher) redirect('/auth/login');
  if (teacher.votingMethod !== 'students') redirect('/teacher');

  const isStopped = votingState?.status === 'stopped';
  const isActive = votingState?.status === 'active';

  const studentVotes = await StudentVote.find({ teacherId: teacher._id }).sort({ createdAt: 1 }).lean();

  // Compute current ranking
  const activeVotes = studentVotes.filter((v) => !v.removed);
  const rankings = activeVotes.map((v) => v.ranking.map((id) => id.toString()));
  const schoolRanking = rankings.length > 0 ? aggregateRankings(rankings) : null;

  let rankingVideos: { id: string; title: string }[] = [];
  if (schoolRanking && schoolRanking.length > 0) {
    const videos = await Video.find({ _id: { $in: schoolRanking } }).lean();
    const videoMap = new Map(videos.map((v) => [v._id.toString(), { id: v._id.toString(), title: v.title }]));
    rankingVideos = schoolRanking
      .map((id) => videoMap.get(id))
      .filter((v): v is { id: string; title: string } => v != null);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

  return (
    <StudentsClient
      teacher={{
        id: teacher._id.toString(),
        joinCode: teacher.joinCode!,
        voteSubmitted: teacher.voteSubmitted,
      }}
      votes={studentVotes.map((v) => ({
        id: v._id.toString(),
        studentName: v.studentName,
        studentClass: v.studentClass,
        removed: v.removed,
        createdAt: v.createdAt ? v.createdAt.toISOString() : new Date().toISOString(),
      }))}
      rankingVideos={rankingVideos}
      isActive={isActive}
      isStopped={isStopped}
      baseUrl={baseUrl}
    />
  );
}
