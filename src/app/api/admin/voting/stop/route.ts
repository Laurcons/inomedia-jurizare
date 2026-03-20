import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import VotingState from '@/models/VotingState';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await getSession();
    if (!session.userId || session.role !== 'admin') {
      return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
    }

    await connectDB();

    const state = await VotingState.findOne();
    if (!state || state.status !== 'active') {
      return NextResponse.json({ error: 'Votarea nu este activă.' }, { status: 400 });
    }

    state.status = 'stopped';
    await state.save();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Eroare internă.' }, { status: 500 });
  }
}
