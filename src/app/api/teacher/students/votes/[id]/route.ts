import { withApiSentry } from '@/lib/withApiSentry';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import StudentVote from '@/models/StudentVote';
import Teacher from '@/models/Teacher';
import { NextRequest, NextResponse } from 'next/server';

export const PATCH = withApiSentry(async (_request: NextRequest, ctx) => {
  const session = await getSession();
  if (!session.userId || session.role !== 'teacher') {
    return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
  }

  const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
  await connectDB();

  const vote = await StudentVote.findById(id);
  if (!vote) return NextResponse.json({ error: 'Vot negăsit.' }, { status: 404 });

  // Ensure this vote belongs to this teacher
  const teacher = await Teacher.findById(session.userId).lean();
  if (!teacher || vote.teacherId.toString() !== session.userId) {
    return NextResponse.json({ error: 'Neautorizat.' }, { status: 403 });
  }

  vote.removed = !vote.removed;
  await vote.save();

  return NextResponse.json({ success: true, removed: vote.removed });
});
