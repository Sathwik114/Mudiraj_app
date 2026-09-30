import { NextResponse } from 'next/server';
import { memberService } from '@/services/memberService';
import { sendApplicationSubmittedEmail } from '@/lib/mailer';

/**
 * Public Membership Application & Status Lookup API
 * -------------------------------------------------
 * GET: Check status by Membership ID, Application No, or Mobile Number (never exposes raw ID number!)
 * POST: Submit a new Membership Application (Status = Pending)
 */

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';

  if (!query.trim()) {
    return NextResponse.json(
      { error: 'Please enter a Membership ID, Application Number, or Mobile Number.' },
      { status: 400 }
    );
  }

  const record = memberService.checkPublicApplicationStatus(query);
  if (!record) {
    return NextResponse.json(
      {
        found: false,
        error: 'No membership record or application found matching that query.',
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    found: true,
    record,
  });
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const created = memberService.submitNewApplication(payload, {
      autoApprove: false,
      actor: 'public',
    });

    const emailResult = await sendApplicationSubmittedEmail(created);

    return NextResponse.json(
      {
        success: true,
        emailSent: emailResult.sent,
        emailReason: emailResult.reason || null,
        message:
          'Your Mudiraj Community Membership Application has been submitted successfully! Once reviewed and approved by the Administrator, your unique Membership ID will be generated and can be checked on the Membership Status page.',
        application: {
          applicationNo: created.applicationNo,
          fullName: created.fullName,
          occupation: created.occupation,
          email: created.email,
          districtName: created.districtName,
          constitutionName: created.constitutionName,
          mandalName: created.mandalName,
          gramamName: created.gramamName,
          status: created.status,
          applicationDate: created.applicationDate,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: err.message || 'Failed to submit application.',
        validationErrors: err.validationErrors || null,
      },
      { status: 400 }
    );
  }
}
