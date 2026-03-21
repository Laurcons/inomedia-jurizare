import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Cod de verificare – Platforma de Jurizare',
    text: `Codul tău de verificare este: ${otp}\n\nCodul este valabil 10 minute.`,
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2>Inomedia - Cod de verificare</h2>
        <p>Codul tău de verificare pentru autentificarea în platforma de jurizare Inomedia este:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px;">
          ${otp}
        </div>
        <p style="color: #666; margin-top: 16px;">Codul este valabil 10 minute.</p>
      </div>
    `,
  });
}
