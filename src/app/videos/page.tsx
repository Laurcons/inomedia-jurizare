import { connectDB } from '@/lib/mongodb';
import Video from '@/models/Video';
import { Suspense } from 'react';
import VideoList from './VideoList';

export const dynamic = 'force-dynamic';

export default async function VideosPage() {
  await connectDB();
  const [videosDocs, categories] = await Promise.all([
    Video.find().lean(),
    Video.distinct('category'),
  ]);

  const videos = videosDocs.map((v) => ({
    id: v._id.toString(),
    title: v.title,
    school: v.school,
    locality: v.locality,
    thumbnailUrl: v.thumbnailUrl,
    youtubeUrl: v.youtubeUrl,
    category: v.category,
  }));

  return (
    <div className="container py-4">
      <h1 className="h4 mb-4">Videoclipurile concursului</h1>
      <Suspense>
        <VideoList videos={videos} categories={categories.sort()} />
      </Suspense>
    </div>
  );
}
