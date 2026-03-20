import { connectDB } from '@/lib/mongodb';
import { sendOtpEmail } from '@/lib/mailer';
import Admin from '@/models/Admin';
import Teacher from '@/models/Teacher';
import { NextRequest, NextResponse } from 'next/server';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Adresa de email este obligatorie.' }, { status: 400 });
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
      return NextResponse.json({ error: 'Adresa de email nu a fost găsită în sistem.' }, { status: 404 });
    }

    // Rate limit: once per minute
    if (user.otpSentAt && Date.now() - new Date(user.otpSentAt).getTime() < 60_000) {
      const secondsLeft = Math.ceil((60_000 - (Date.now() - new Date(user.otpSentAt).getTime())) / 1000);
      return NextResponse.json({ error: `Poți solicita un nou cod în ${secondsLeft} secunde.` }, { status: 429 });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpSentAt = new Date();
    await user.save();

    if (process.env.DEV_MODE !== 'true') {
      await sendOtpEmail(normalizedEmail, otp);
    }

    return NextResponse.json({ success: true, role });
  } catch {
    return NextResponse.json({ error: 'Eroare internă. Încearcă din nou.' }, { status: 500 });
  }
}
