import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { memberService } from '@/services/memberService';
import { sendMembershipApprovedEmail } from '@/lib/mailer';

export async function GET(request) {
  const { authorized } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized administrator access.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get('id');
  if (memberId) {
    const member = memberService.getMemberDetails(memberId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }
    return NextResponse.json({ member });
  }

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '15', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const districtId = searchParams.get('districtId') || '';
  const constitutionId = searchParams.get('constitutionId') || '';
  const mandalId = searchParams.get('mandalId') || '';
  const teamType = searchParams.get('teamType') || '';
  const positionCode = searchParams.get('positionCode') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const result = memberService.getPaginatedMembers({
    page,
    limit,
    search,
    status,
    districtId,
    constitutionId,
    mandalId,
    teamType,
    positionCode,
    sortBy,
    sortOrder,
  });

  return NextResponse.json(result);
}

export async function POST(request) {
  const { authorized, admin } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized administrator access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const autoApprove = body.autoApprove !== false;
    const created = memberService.submitNewApplication(body, {
      autoApprove,
      actor: admin.username,
    });

    let emailResult = { sent: false };
    if (autoApprove && created.email) {
      emailResult = await sendMembershipApprovedEmail(created);
    }

    return NextResponse.json(
      {
        success: true,
        emailSent: emailResult.sent,
        message: autoApprove
          ? `Member registered and approved with Membership ID ${created.membershipId} and Password ${created.memberPassword}.${
              emailResult.sent ? ` Credentials sent to ${created.email}.` : ''
            }`
          : `Application ${created.applicationNo} created.`,
        member: created,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: err.message || 'Failed to register member.',
        validationErrors: err.validationErrors || null,
      },
      { status: 400 }
    );
  }
}

export async function PATCH(request) {
  const { authorized, admin } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized administrator access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, memberId, remarks, targetStatus, updates } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required.' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const updated = memberService.approveApplication({
        memberId,
        remarks,
        targetStatus: targetStatus || 'Active',
        actor: admin.username,
      });

      const emailResult = await sendMembershipApprovedEmail(updated);
      const emailNotice = emailResult.sent
        ? ` Credentials emailed to ${updated.email}.`
        : updated.email
        ? ` (Email not sent: ${emailResult.reason})`
        : ' (No email address on record)';

      return NextResponse.json({
        success: true,
        emailSent: emailResult.sent,
        message: `Application approved! Membership ID: ${updated.membershipId} | 6-Digit Password: ${updated.memberPassword}.${emailNotice}`,
        member: updated,
      });
    }

    if (action === 'REJECT') {
      const updated = memberService.rejectApplication({
        memberId,
        remarks,
        actor: admin.username,
      });
      return NextResponse.json({
        success: true,
        message: `Application marked as Rejected.`,
        member: updated,
      });
    }

    if (action === 'REVOKE') {
      const updated = memberService.updateMember({
        memberId,
        updates: { status: 'Pending', remarks: 'Rejection revoked by admin. Pending review.' },
        actor: admin.username,
      });
      return NextResponse.json({
        success: true,
        message: `Application status revoked to Pending.`,
        member: updated,
      });
    }

    const updated = memberService.updateMember({
      memberId,
      updates: updates || body,
      actor: admin.username,
    });

    return NextResponse.json({
      success: true,
      message: `Member record updated successfully.`,
      member: updated,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to update member.' },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  const { authorized, admin } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized administrator access.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required.' }, { status: 400 });
    }

    memberService.deleteMember({
      memberId,
      actor: admin.username,
    });

    return NextResponse.json({
      success: true,
      message: 'Member deleted successfully.',
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete member.' },
      { status: 400 }
    );
  }
}
