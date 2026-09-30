import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, getAdminSession } from '@/lib/auth';
import { recordAuditLog } from '@/lib/database';

export async function POST() {
  const session = await getAdminSession();
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  if (session) {
    recordAuditLog({
      action: 'ADMIN_LOGOUT',
      entityType: 'Admin',
      entityId: session.sub,
      actor: session.username,
      details: `Administrator "${session.fullName}" signed out.`,
    });
  }

  return NextResponse.json({ success: true });
}
