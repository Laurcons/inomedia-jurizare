import { withApiSentry } from '@/lib/withApiSentry';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { generateStudentCode } from '@/lib/student-code';
import Teacher from '@/models/Teacher';
import VotingState from '@/models/VotingState';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withApiSentry(async (request: NextRequest) => {
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
    let saved = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      teacher.joinCode = generateStudentCode();
      try {
        await teacher.save();
        saved = true;
        break;
      } catch (err: unknown) {
        if ((err as { code?: number }).code === 11000) continue;
        throw err;
      }
    }
    if (!saved) return NextResponse.json({ error: 'Eroare internă.' }, { status: 500 });
  } else {
    await teacher.save();
  }

  return NextResponse.json({ success: true, joinCode: teacher.joinCode });
});
