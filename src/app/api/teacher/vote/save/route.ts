import { withApiSentry } from '@/lib/withApiSentry';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import Teacher from '@/models/Teacher';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withApiSentry(async (request: NextRequest) => {
  const session = await getSession();
  if (!session.userId || session.role !== 'teacher') {
    return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
  }

  const { ranking } = await request.json();
  if (!Array.isArray(ranking) || ranking.length > 10) {
    return NextResponse.json({ error: 'Clasament invalid.' }, { status: 400 });
  }

  await connectDB();
  await Teacher.findByIdAndUpdate(session.userId, { submittedRanking: ranking });
  return NextResponse.json({ success: true });
});
