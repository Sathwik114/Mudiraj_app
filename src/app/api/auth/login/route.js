import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDatabase, saveDatabase, recordAuditLog } from '@/lib/database';
import {
  verifyPassword,
  createSessionToken,
  getAdminSession,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  return NextResponse.json({
    authenticated: true,
    admin: {
      id: session.sub,
      username: session.username,
      email: session.email,
      fullName: session.fullName,
      role: session.role,
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = String(body.username || body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Username/Email and Password are required.' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const admin = db.admins.find(
      (a) =>
        a.status === 'Active' &&
        (a.username.toLowerCase() === identifier || a.email.toLowerCase() === identifier)
    );

    if (!admin || !verifyPassword(password, admin.passwordHash, admin.passwordSalt)) {
      return NextResponse.json(
        { error: 'Invalid administrator credentials. Please verify your username and password.' },
        { status: 401 }
      );
    }

    admin.lastLoginAt = new Date().toISOString();
    saveDatabase(db);

    const token = createSessionToken(admin);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    });

    recordAuditLog({
      action: 'ADMIN_LOGIN',
      entityType: 'Admin',
      entityId: admin.id,
      actor: admin.username,
      details: `Administrator "${admin.fullName}" (${admin.username}) signed in.`,
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Authentication failed.' },
      { status: 500 }
    );
  }
}
