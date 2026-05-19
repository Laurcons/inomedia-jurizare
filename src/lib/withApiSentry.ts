import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './session';

type Handler = (req: NextRequest, ctx?: unknown) => Promise<NextResponse>;

export function withApiSentry(handler: Handler): Handler {
  return async (req, ctx) => {
    let response: NextResponse;
    try {
      response = await handler(req, ctx);
    } catch (err) {
      const session = await getSession().catch(() => null);
      Sentry.captureException(err, {
        user: session?.userId ? { id: session.userId, data: { role: session.role } } : undefined,
        extra: { method: req.method, url: req.url },
      });
      return NextResponse.json({ error: 'Eroare internă.' }, { status: 500 });
    }

    const status = response.status;
    // Skip 401/403 — expected auth failures, not actionable noise
    if (status >= 400 && status !== 401 && status !== 403) {
      const session = await getSession().catch(() => null);
      const body = await response.clone().json().catch(() => null);
      Sentry.captureEvent({
        level: status >= 500 ? 'error' : 'warning',
        message: `${req.method} ${new URL(req.url).pathname} → ${status}`,
        user: session?.userId ? { id: session.userId, data: { role: session.role } } : undefined,
        extra: { responseBody: body, method: req.method, url: req.url },
      });
    }

    return response;
  };
}
