import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import StudentVote from '@/models/StudentVote';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.userId || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
    }

    await connectDB();
    const votes = await StudentVote.find({ teacherId: session.userId })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      votes: votes.map((v) => ({
        id: v._id.toString(),
        studentName: v.studentName,
        studentClass: v.studentClass,
        removed: v.removed,
        createdAt: v.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Eroare internă.' }, { status: 500 });
  }
}
