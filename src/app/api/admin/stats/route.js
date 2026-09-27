import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { memberService } from '@/services/memberService';
import { getDatabase } from '@/lib/database';
import { getSmtpConfig, saveSmtpConfig } from '@/lib/mailer';

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
  const smtp = getSmtpConfig();

  return NextResponse.json({
    admin,
    smtpConfig: {
      smtpEmail: smtp.smtpEmail,
      isConfigured: smtp.isConfigured,
    },
    ...reportData,
  });
}

export async function POST(request) {
  const { authorized, admin } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized administrator access.' }, { status: 401 });
  }

  try {
    const { smtpEmail, smtpAppPassword } = await request.json();
    const updated = saveSmtpConfig({
      smtpEmail,
      smtpAppPassword,
      actor: admin.username,
    });

    return NextResponse.json({
      success: true,
      message: 'Gmail SMTP credentials saved successfully.',
      smtpConfig: {
        smtpEmail: updated.smtpEmail,
        isConfigured: updated.isConfigured,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to save SMTP settings.' },
      { status: 400 }
    );
  }
}
