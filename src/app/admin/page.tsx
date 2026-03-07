import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import StudentVote from '@/models/StudentVote';
import Video from '@/models/Video';
import VotingState from '@/models/VotingState';
import AdminClient from './AdminClient';
import { computeNationalRanking } from '@/lib/borda';
import type { ITeacher } from '@/models/Teacher';
import type { IVideo } from '@/models/Video';

export default async function AdminPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'admin') redirect('/auth/login');

  await connectDB();

  const [votingState, teachers, allVideos] = await Promise.all([
    VotingState.findOne().lean(),
    Teacher.find().lean(),
    Video.find().lean(),
  ]);

  const status = votingState?.status ?? 'not_started';

  // Compute national ranking if voting has started
  let nationalRanking: { videoId: string; score: number; title: string }[] = [];

  if (status !== 'not_started') {
    const submittedTeachers = teachers.filter((t) => t.voteSubmitted);

    const simpleVotes: string[][] = submittedTeachers
      .filter((t) => t.votingMethod === 'simple')
      .map((t) => t.submittedRanking.map((id) => id.toString()));

    // For student-mode teachers, submittedRanking already contains the aggregated school ranking
    const schoolRankings: string[][] = submittedTeachers
      .filter((t) => t.votingMethod === 'students')
      .map((t) => t.submittedRanking.map((id) => id.toString()));

    const raw = computeNationalRanking(simpleVotes, schoolRankings);
    const videoMap = new Map(allVideos.map((v) => [v._id.toString(), v.title]));
    nationalRanking = raw
      .slice(0, 10)
      .map(({ videoId, score }) => ({
        videoId,
        score,
        title: videoMap.get(videoId) ?? 'Videoclip necunoscut',
      }));
  }

  // Gather student vote counts per teacher
  const studentVoteCounts = await StudentVote.aggregate([
    { $match: { removed: false } },
    { $group: { _id: '$teacherId', count: { $sum: 1 } } },
  ]);
  const studentCountMap = new Map<string, number>(
    studentVoteCounts.map(({ _id, count }) => [_id.toString(), count]),
  );

  return (
    <AdminClient
      status={status}
      teachers={teachers.map((t) => ({
        id: t._id.toString(),
        fullName: t.fullName,
        school: t.school,
        locality: t.locality,
        county: t.county,
        votingMethod: t.votingMethod,
        voteSubmitted: t.voteSubmitted,
        studentVoteCount: studentCountMap.get(t._id.toString()) ?? 0,
      }))}
      nationalRanking={nationalRanking}
    />
  );
}
