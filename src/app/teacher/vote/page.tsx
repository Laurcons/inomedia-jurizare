import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import Video from '@/models/Video';
import VotingState from '@/models/VotingState';
import VotingInterface from '@/components/VotingInterface';
import type { VideoItem } from '@/components/VotingInterface';

export default async function TeacherVotePage() {
  const session = await getSession();
  await connectDB();

  const [teacher, allVideos, votingState] = await Promise.all([
    Teacher.findById(session.userId).lean(),
    Video.find().lean(),
    VotingState.findOne().lean(),
  ]);

  if (!teacher) redirect('/auth/login');
  if (votingState?.status !== 'active') redirect('/teacher');
  if (teacher.votingMethod !== 'simple') redirect('/teacher');
  if (teacher.voteSubmitted) redirect('/teacher');

  // Build the ordered video list: saved ranking first, then remaining
  const videoMap = new Map(allVideos.map((v) => [v._id.toString(), v]));
  const savedIds = (teacher.submittedRanking ?? []).map((id) => id.toString());

  const rankedVideos: VideoItem[] = savedIds
    .filter((id) => videoMap.has(id))
    .map((id) => {
      const v = videoMap.get(id)!;
      return { id, title: v.title, thumbnailUrl: v.thumbnailUrl };
    });

  const rankedSet = new Set(savedIds);
  const unrankedVideos: VideoItem[] = allVideos
    .filter((v) => !rankedSet.has(v._id.toString()))
    .map((v) => ({ id: v._id.toString(), title: v.title, thumbnailUrl: v.thumbnailUrl }));

  return (
    <div className="row">
      <div className="col-lg-8">
        <h2 className="h4 mb-1">Jurizare Simplă</h2>
        <p className="text-muted mb-4">
          Ordonează videoclipurile pentru a crea clasamentul tău top 10. Modificările sunt salvate
          automat.
        </p>
        <VotingInterface
          rankedVideos={rankedVideos}
          unrankedVideos={unrankedVideos}
          saveUrl="/api/teacher/vote/save"
          castUrl="/api/teacher/vote/cast"
          castRedirect="/teacher"
        />
      </div>
    </div>
  );
}
