import { NextResponse } from 'next/server';
import { fetchEmployerProfile, getCurrentSession, publicUser, findUserById } from '@/server/auth/local-auth';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const user = await findUserById(session.userId);
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const employer = await fetchEmployerProfile(user.id);
  return NextResponse.json({
    user: {
      ...publicUser(user),
      employerProfile: employer.employerProfile,
    },
    package: employer.package,
  });
}
