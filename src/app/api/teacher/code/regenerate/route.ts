import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import VotingState from '@/models/VotingState';
import { getSession } from '@/lib/session';
import { generateUniqueStudentCode } from '@/lib/student-code';

export async function POST() {
  try {
    const session = await getSession();
    if (!session.userId || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
    }

    await connectDB();

    const votingState = await VotingState.findOne().lean();
    if (votingState?.status !== 'active') {
      return NextResponse.json({ error: 'Votarea nu este activă.' }, { status: 400 });
    }

    const teacher = await Teacher.findById(session.userId);
    if (!teacher) return NextResponse.json({ error: 'Utilizator negăsit.' }, { status: 404 });
    if (teacher.votingMethod !== 'students') {
      return NextResponse.json({ error: 'Metoda de votare incorectă.' }, { status: 400 });
    }

    const allTeachers = await Teacher.find({}, 'joinCode').lean();
    const activeCodes = new Set(
      allTeachers.filter((t) => t._id.toString() !== session.userId).map((t) => t.joinCode).filter(Boolean),
    );

    const newCode = generateUniqueStudentCode(activeCodes);
    teacher.previousCodes.push(teacher.joinCode);
    teacher.joinCode = newCode;
    await teacher.save();

    return NextResponse.json({ success: true, code: newCode });
  } catch {
    return NextResponse.json({ error: 'Eroare internă.' }, { status: 500 });
  }
}
