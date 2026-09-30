import { NextResponse } from 'next/server';
import { requireAdminAuth, verifyPassword, hashPassword } from '@/lib/auth';
import { getDatabase, saveDatabase, recordAuditLog } from '@/lib/database';

export async function POST(request) {
  const { authorized, admin } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword || String(newPassword).length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const adminRecord = db.admins.find((a) => a.id === admin.sub);
    if (!adminRecord) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 });
    }

    if (!verifyPassword(currentPassword, adminRecord.passwordHash, adminRecord.passwordSalt)) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    const { salt, hash } = hashPassword(newPassword);
    adminRecord.passwordSalt = salt;
    adminRecord.passwordHash = hash;
    saveDatabase(db);

    recordAuditLog({
      action: 'ADMIN_PASSWORD_CHANGED',
      entityType: 'Admin',
      entityId: adminRecord.id,
      actor: adminRecord.username,
      details: 'Administrator updated account password.',
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to update password.' }, { status: 500 });
  }
}
