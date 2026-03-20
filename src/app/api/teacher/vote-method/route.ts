import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { generateUniqueStudentCode } from '@/lib/student-code';
import Teacher from '@/models/Teacher';
import VotingState from '@/models/VotingState';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
    }

    const { method } = await request.json();
    if (method !== 'simple' && method !== 'students') {
      return NextResponse.json({ error: 'Metodă invalidă.' }, { status: 400 });
    }

    await connectDB();

    const votingState = await VotingState.findOne().lean();
    if (votingState?.status !== 'active') {
      return NextResponse.json({ error: 'Votarea nu este activă.' }, { status: 400 });
    }

    const teacher = await Teacher.findById(session.userId);
    if (!teacher) return NextResponse.json({ error: 'Utilizator negăsit.' }, { status: 404 });

    if (teacher.votingMethod) {
      return NextResponse.json({ error: 'Metoda a fost deja aleasă.' }, { status: 400 });
    }

    teacher.votingMethod = method;

    if (method === 'students') {
      const allTeachers = await Teacher.find({}, 'joinCode').lean();
      const activeCodes = new Set(allTeachers.map((t) => t.joinCode).filter(Boolean));
      teacher.joinCode = generateUniqueStudentCode(activeCodes);
    }

    await teacher.save();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Eroare internă.' }, { status: 500 });
  }
}
