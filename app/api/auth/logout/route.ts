import { NextResponse, type NextRequest } from 'next/server';
import { deleteSessionByToken } from '@/server/auth/local-auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('local_session')?.value;
  if (token) await deleteSessionByToken(token);

  const res = NextResponse.json({ success: true });
  res.cookies.set('local_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
