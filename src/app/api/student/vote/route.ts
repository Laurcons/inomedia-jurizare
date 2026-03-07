import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import StudentVote from '@/models/StudentVote';
import Video from '@/models/Video';
import VotingState from '@/models/VotingState';

export async function POST(request: NextRequest) {
  try {
    const { ranking, studentName, studentClass, code } = await request.json();

    if (!code || !ranking || !Array.isArray(ranking) || ranking.length !== 10) {
      return NextResponse.json(
        { error: 'Clasamentul trebuie să conțină exact 10 videoclipuri.' },
        { status: 400 },
      );
    }

    if (!studentName?.trim() || !studentClass?.trim()) {
      return NextResponse.json(
        { error: 'Numele și clasa sunt obligatorii.' },
        { status: 400 },
      );
    }

    await connectDB();

    const votingState = await VotingState.findOne().lean();
    if (votingState?.status !== 'active') {
      return NextResponse.json({ error: 'Votarea nu este activă.' }, { status: 400 });
    }

    const teacher = await Teacher.findOne({ joinCode: code.toUpperCase() }).lean();
    if (!teacher) {
      return NextResponse.json({ error: 'Cod de acces invalid.' }, { status: 404 });
    }

    if (teacher.voteSubmitted) {
      return NextResponse.json(
        { error: 'Profesorul a finalizat deja colectarea voturilor.' },
        { status: 400 },
      );
    }

    // Validate video IDs
    const videoCount = await Video.countDocuments({ _id: { $in: ranking } });
    if (videoCount !== 10) {
      return NextResponse.json({ error: 'Videoclipuri invalide.' }, { status: 400 });
    }

    await StudentVote.create({
      teacherId: teacher._id,
      studentName: studentName.trim(),
      studentClass: studentClass.trim(),
      ranking,
      removed: false,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Eroare internă.' }, { status: 500 });
  }
}
