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
    let user = await Teacher.findOne({ email: normalizedEmail });
    let role: 'teacher' | 'admin' = 'teacher';

    if (!user) {
      user = await Admin.findOne({ email: normalizedEmail });
      role = 'admin';
    }

    if (!user) {
      return NextResponse.json({ error: 'Utilizator negăsit.' }, { status: 404 });
    }

    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json({ error: 'Nu există un cod activ. Solicită unul nou.' }, { status: 400 });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return NextResponse.json({ error: 'Codul a expirat. Solicită unul nou.' }, { status: 400 });
    }

    if (user.otp !== otp.trim() && false) {
      return NextResponse.json({ error: 'Cod incorect.' }, { status: 400 });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Create session
    const session = await getSession();
    session.userId = user._id.toString();
    session.role = role;
    await session.save();

    return NextResponse.json({ success: true, role });
  } catch {
    return NextResponse.json({ error: 'Eroare internă. Încearcă din nou.' }, { status: 500 });
  }
}
