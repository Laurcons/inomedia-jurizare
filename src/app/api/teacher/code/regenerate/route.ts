import { withApiSentry } from '@/lib/withApiSentry';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { generateStudentCode } from '@/lib/student-code';
import Teacher from '@/models/Teacher';
import VotingState from '@/models/VotingState';
import { NextResponse } from 'next/server';

export const POST = withApiSentry(async () => {
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

  let saved = false;
  let newCode = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    newCode = generateStudentCode();
    try {
      if (teacher.joinCode) teacher.previousCodes.push(teacher.joinCode);
      teacher.joinCode = newCode;
      await teacher.save();
      saved = true;
      break;
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 11000) continue;
      throw err;
    }
  }
  if (!saved) return NextResponse.json({ error: 'Eroare internă.' }, { status: 500 });

  return NextResponse.json({ success: true, code: newCode });
});
