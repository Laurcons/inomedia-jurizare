import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VotingState from '@/models/VotingState';
import { getSession } from '@/lib/session';

export async function POST() {
  try {
    const session = await getSession();
    if (!session.userId || session.role !== 'admin') {
      return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 });
    }

    await connectDB();

    const state = await VotingState.findOne();
    if (state) {
      if (state.status !== 'not_started') {
        return NextResponse.json({ error: 'Votarea este deja activă sau s-a încheiat.' }, { status: 400 });
      }
      state.status = 'active';
      await state.save();
    } else {
      await VotingState.create({ status: 'active' });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Eroare internă.' }, { status: 500 });
  }
}
