import { withApiSentry } from '@/lib/withApiSentry';
import { connectDB } from '@/lib/mongodb';
import Video from '@/models/Video';
import { NextResponse } from 'next/server';

export const GET = withApiSentry(async () => {
  await connectDB();
  const videos = await Video.find({}, '_id title').lean();
  return NextResponse.json(videos.map((v) => ({ id: v._id.toString(), title: v.title })));
});
