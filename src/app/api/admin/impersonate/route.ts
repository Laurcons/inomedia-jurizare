import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { withApiSentry } from '@/lib/withApiSentry';
import Admin from '@/models/Admin';
import Teacher from '@/models/Teacher';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withApiSentry(async (req: NextRequest) => {
  const session = await getSession();
  if (!session.userId || session.role !== 'admin') {
    return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
  }

  await connectDB();

  const admin = await Admin.findById(session.userId).lean();
  if (!admin?.canImpersonate) {
    return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
  }

  const { teacherId } = await req.json();
  const teacher = await Teacher.findById(teacherId).lean();
  if (!teacher) {
    return NextResponse.json({ error: 'Profesorul nu a fost găsit.' }, { status: 404 });
  }

  session.originalAdminId = session.userId;
  session.userId = teacher._id.toString();
  session.role = 'teacher';
  await session.save();

  return NextResponse.json({ success: true });
});
