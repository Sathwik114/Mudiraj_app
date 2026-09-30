import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { memberService } from '@/services/memberService';
import { getDatabase } from '@/lib/database';
import { getSmtpConfig, saveSmtpConfig } from '@/lib/mailer';
import { getSmsConfig, saveSmsConfig, sendMembershipCredentialsSms } from '@/lib/sms';

export async function GET(request) {
  const { authorized, admin } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized administrator access.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const exportBackup = searchParams.get('backup') === '1';

  const db = getDatabase();
  if (exportBackup) {
    const safeBackup = {
      ...db,
      admins: db.admins.map(({ passwordHash, passwordSalt, ...rest }) => rest),
    };
    return NextResponse.json({ backup: safeBackup });
  }

  const reportData = memberService.getDashboardAndReportStats();
  const smtp = getSmtpConfig();
  const sms = getSmsConfig();

  return NextResponse.json({
    admin,
    smtpConfig: {
      smtpEmail: smtp.smtpEmail,
      isConfigured: smtp.isConfigured,
    },
    smsConfig: {
      provider: sms.provider,
      twilioAccountSid: sms.twilioAccountSid,
      twilioPhoneNumber: sms.twilioPhoneNumber,
      isConfigured: sms.isConfigured,
    },
    recentSmsLogs: (db.smsLogs || []).slice(0, 25),
    ...reportData,
  });
}

export async function POST(request) {
  const { authorized, admin } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized administrator access.' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Handle SMS Gateway Settings update or Test SMS dispatch
    if (body.action === 'SAVE_SMS_CONFIG') {
      const updatedSms = saveSmsConfig({
        provider: body.provider,
        smsApiKey: body.smsApiKey,
        twilioAccountSid: body.twilioAccountSid,
        twilioAuthToken: body.twilioAuthToken,
        twilioPhoneNumber: body.twilioPhoneNumber,
        actor: admin.username,
      });

      return NextResponse.json({
        success: true,
        message: 'India (+91) SMS Gateway configuration saved successfully.',
        smsConfig: {
          provider: updatedSms.provider,
          twilioAccountSid: updatedSms.twilioAccountSid,
          twilioPhoneNumber: updatedSms.twilioPhoneNumber,
          isConfigured: updatedSms.isConfigured,
        },
      });
    }

    if (body.action === 'TEST_SMS') {
      const testResult = await sendMembershipCredentialsSms(
        {
          id: 'test-sms',
          fullName: body.fullName || 'Sathya Sathwik Pushpagiri',
          mobile: body.mobile || '7285972050',
          membershipId: body.membershipId || 'MUD-00000003',
          memberPassword: body.memberPassword || 'PUS728',
        },
        {
          actor: admin.username,
          trigger: 'ADMIN_TEST_SMS',
        }
      );

      const db = getDatabase();
      return NextResponse.json({
        success: true,
        smsResult: testResult,
        recentSmsLogs: (db.smsLogs || []).slice(0, 25),
        message: testResult.sent
          ? `Test SMS delivered to ${testResult.mobile}!`
          : `Gateway did not deliver automatically (${testResult.gatewayReason || 'Not configured'}). Use the direct Send SMS (${testResult.mobile}) button below or check API credentials.`,
      });
    }

    // Fallback: SMTP config update
    const { smtpEmail, smtpAppPassword } = body;
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
      { error: err.message || 'Failed to save settings.' },
      { status: 400 }
    );
  }
}
