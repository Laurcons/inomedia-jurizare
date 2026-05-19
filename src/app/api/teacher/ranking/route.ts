import { withApiSentry } from '@/lib/withApiSentry';
import { aggregateRankings } from '@/lib/borda';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import StudentVote from '@/models/StudentVote';
import Teacher from '@/models/Teacher';
import Video from '@/models/Video';
import { NextResponse } from 'next/server';

export const GET = withApiSentry(async () => {
  const session = await getSession();
  if (!session.userId || session.role !== 'teacher') {
    return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
  }

  await connectDB();

  const teacher = await Teacher.findById(session.userId).lean();
  if (!teacher) return NextResponse.json({ error: 'Utilizator negăsit.' }, { status: 404 });

  const activeVotes = await StudentVote.find({
    teacherId: session.userId,
    removed: false,
  }).lean();

  if (activeVotes.length === 0) {
    return NextResponse.json({ ranking: [] });
  }

  const rankings = activeVotes.map((v) => v.ranking.map((id) => id.toString()));
  const schoolRanking = aggregateRankings(rankings);

  const videos = await Video.find({ _id: { $in: schoolRanking } }).lean();
  const videoMap = new Map(videos.map((v) => [v._id.toString(), v]));
  const rankingVideos = schoolRanking
    .map((id) => videoMap.get(id))
    .filter(Boolean)
    .map((v) => ({ id: v!._id.toString(), title: v!.title }));

  return NextResponse.json({ ranking: rankingVideos });
});
