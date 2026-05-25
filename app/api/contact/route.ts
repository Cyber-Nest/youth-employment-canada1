import { randomUUID } from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { collection } from '@/server/db/mongo';
import type { ContactInquiryDoc } from '@/server/db/models';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const firstName = String(body.firstName ?? '').trim();
  const lastName = String(body.lastName ?? '').trim();
  const email = String(body.email ?? '').trim();
  const inquiryType = String(body.inquiryType ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!firstName || !lastName || !email || !inquiryType || !message) {
    return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }

  const now = new Date();
  await (await collection<ContactInquiryDoc>('contactInquiries')).insertOne({
    id: randomUUID(),
    firstName,
    lastName,
    email,
    inquiryType,
    message,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ success: true, message: 'Message sent successfully.' }, { status: 201 });
}
