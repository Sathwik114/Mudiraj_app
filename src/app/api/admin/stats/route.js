import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { memberService } from '@/services/memberService';
import { getDatabase } from '@/lib/database';

export async function GET(request) {
  const { authorized, admin } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized administrator access.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const exportBackup = searchParams.get('backup') === '1';

  if (exportBackup) {
    const db = getDatabase();
    const safeBackup = {
      ...db,
      admins: db.admins.map(({ passwordHash, passwordSalt, ...rest }) => rest),
    };
    return NextResponse.json({ backup: safeBackup });
  }

  const reportData = memberService.getDashboardAndReportStats();
  return NextResponse.json({
    admin,
    ...reportData,
  });
}
