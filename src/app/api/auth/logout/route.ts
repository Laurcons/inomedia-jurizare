import { withApiSentry } from '@/lib/withApiSentry';
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export const POST = withApiSentry(async () => {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ success: true });
});
