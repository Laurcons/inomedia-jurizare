import type { VideoItem } from '@/components/VotingInterface';
import { connectDB } from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import Video from '@/models/Video';
import VotingState from '@/models/VotingState';
import StudentVotingClient from './StudentVotingClient';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function StudentVotePage({ params }: PageProps) {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  await connectDB();

  const [votingState, teacher, allVideos] = await Promise.all([
    VotingState.findOne().lean(),
    Teacher.findOne({
      $or: [{ joinCode: upperCode }, { previousCodes: upperCode }],
    }).lean(),
    Video.find().lean(),
  ]);

  if (!teacher) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="card shadow-sm" style={{ maxWidth: 420 }}>
          <div className="card-body p-4 text-center">
            <h2 className="h5 mb-3">Cod necunoscut</h2>
            <p className="text-muted">Codul introdus nu există. Verifică codul și încearcă din nou.</p>
            <a href="/student" className="btn btn-primary mt-2">
              Înapoi
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If code is in previousCodes (invalidated), show error
  const isInvalidated = teacher.previousCodes.includes(upperCode) && teacher.joinCode !== upperCode;
  if (isInvalidated) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="card shadow-sm" style={{ maxWidth: 420 }}>
          <div className="card-body p-4 text-center">
            <h2 className="h5 mb-3">Cod expirat</h2>
            <p className="text-muted">Acest cod nu mai este valid. Solicită un cod nou de la profesorul tău.</p>
            <a href="/student" className="btn btn-primary mt-2">
              Înapoi
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (votingState?.status === 'not_started') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="card shadow-sm" style={{ maxWidth: 420 }}>
          <div className="card-body p-4 text-center">
            <h2 className="h5 mb-3">Jurizarea nu a început</h2>
            <p className="text-muted">Revino mai târziu.</p>
          </div>
        </div>
      </div>
    );
  }

  if (votingState?.status === 'stopped') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="card shadow-sm border-warning" style={{ maxWidth: 420 }}>
          <div className="card-body p-4 text-center">
            <h2 className="h5 mb-3">Jurizarea s-a încheiat</h2>
            <p className="text-muted">Nu mai sunt acceptate voturi. Mulțumim pentru participare!</p>
          </div>
        </div>
      </div>
    );
  }

  const videos: VideoItem[] = allVideos.map((v) => ({
    id: v._id.toString(),
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
  }));

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <StudentVotingClient teacherId={teacher._id.toString()} code={upperCode} videos={videos} />
        </div>
      </div>
    </div>
  );
}
