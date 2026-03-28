import { connectDB } from '@/lib/mongodb';
import Video from '@/models/Video';

export const dynamic = 'force-dynamic';

export default async function VideosPage() {
  await connectDB();
  const videos = await Video.find().lean();

  return (
    <div className="container py-4">
      <h1 className="h4 mb-4">Videoclipurile concursului</h1>
      <div className="list-group">
        {videos.map((video) => {
          const id = video._id.toString();
          return (
            <div key={id} className="list-group-item d-flex align-items-center gap-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnailUrl}
                alt=""
                width={80}
                height={45}
                style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
              />
              <div className="flex-grow-1">
                <div className="fw-medium">{video.title}</div>
                <div className="text-muted small">{video.school}, {video.locality}</div>
              </div>
              <a
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-danger flex-shrink-0"
              >
                ▶ YouTube
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
