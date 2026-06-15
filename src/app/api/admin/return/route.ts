import { withApiSentry } from '@/lib/withApiSentry';
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export const POST = withApiSentry(async () => {
  const session = await getSession();
  if (!session.originalAdminId) {
    return NextResponse.json({ error: 'Nu ești în modul impersonificare.' }, { status: 400 });
  }

  session.userId = session.originalAdminId;
  session.role = 'admin';
  session.originalAdminId = undefined;
  await session.save();

  return NextResponse.json({ success: true });
});
