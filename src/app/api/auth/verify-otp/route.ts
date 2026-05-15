import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import Admin from '@/models/Admin';
import Teacher from '@/models/Teacher';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'Date incomplete.' }, { status: 400 });
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();
    let user = await Teacher.findOneAndUpdate(
      { email: normalizedEmail },
      { $inc: { otpAttempts: 1 } },
      { new: true }
    );
    let role: 'teacher' | 'admin' = 'teacher';

    if (!user) {
      user = await Admin.findOneAndUpdate(
        { email: normalizedEmail },
        { $inc: { otpAttempts: 1 } },
        { new: true }
      );
      role = 'admin';
    }

    if (!user) {
      return NextResponse.json({ error: 'Utilizator negăsit.' }, { status: 404 });
    }

    if (process.env.DEV_MODE !== 'true' && user.otpAttempts > 5) {
      return NextResponse.json({ error: 'Prea multe încercări. Solicită un cod nou.' }, { status: 429 });
    }

    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json({ error: 'Nu există un cod activ. Solicită unul nou.' }, { status: 400 });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return NextResponse.json({ error: 'Codul a expirat. Solicită unul nou.' }, { status: 400 });
    }

    const devBypass = process.env.DEV_MODE === 'true' && otp.trim() === '000000';
    if (!devBypass && user.otp !== otp.trim()) {
      return NextResponse.json({ error: 'Cod incorect.' }, { status: 400 });
    }

    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    const session = await getSession();
    session.userId = user._id.toString();
    session.role = role;
    await session.save();

    return NextResponse.json({ success: true, role });
  } catch {
    return NextResponse.json({ error: 'Eroare internă. Încearcă din nou.' }, { status: 500 });
  }
}
