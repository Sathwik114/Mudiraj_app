import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { memberService } from '@/services/memberService';
import { sendMembershipCredentialsSms } from '@/lib/sms';

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

    let smsResult = { sent: false };
    if (autoApprove && created.mobile) {
      smsResult = await sendMembershipCredentialsSms(created, {
        actor: admin.username,
        trigger: 'DIRECT_REGISTRATION',
      });
    }

    const formattedMobile = smsResult.mobile || created.mobile;

    return NextResponse.json(
      {
        success: true,
        smsSent: smsResult.sent,
        smsReason: smsResult.gatewayReason || null,
        smsMessage: smsResult.messageText || null,
        smsUri: smsResult.smsUri || null,
        whatsappUri: smsResult.whatsappUri || null,
        formattedMobile,
        message: autoApprove
          ? smsResult.sent
            ? `Member registered and approved! Membership ID: ${created.membershipId} | Password: ${created.memberPassword}. SMS text message delivered to ${formattedMobile}.`
            : `Member registered and approved! Membership ID: ${created.membershipId} | Password: ${created.memberPassword}. Click "Send SMS (${formattedMobile})" below or configure SMS Gateway in Settings.`
          : `Application ${created.applicationNo} created.`,
        member: {
          ...created,
          smsDelivery: smsResult,
        },
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

      const smsResult = await sendMembershipCredentialsSms(updated, {
        actor: admin.username,
        trigger: 'ADMIN_APPROVAL',
      });

      const formattedMobile = smsResult.mobile || updated.mobile;

      return NextResponse.json({
        success: true,
        smsSent: smsResult.sent,
        smsReason: smsResult.gatewayReason || null,
        smsMessage: smsResult.messageText || null,
        smsUri: smsResult.smsUri || null,
        whatsappUri: smsResult.whatsappUri || null,
        formattedMobile,
        message: smsResult.sent
          ? `Application approved! Membership ID: ${updated.membershipId} | Password: ${updated.memberPassword}. SMS text message delivered to ${formattedMobile}.`
          : `Application approved! Membership ID: ${updated.membershipId} | Password: ${updated.memberPassword}. Click "Send SMS (${formattedMobile})" below or configure SMS Gateway in Settings.`,
        member: {
          ...updated,
          smsDelivery: smsResult,
        },
      });
    }

    if (action === 'RESEND_SMS') {
      const existing = memberService.getMemberDetails(memberId);
      if (!existing) {
        return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
      }
      const smsResult = await sendMembershipCredentialsSms(existing, {
        actor: admin.username,
        trigger: 'MANUAL_RESEND',
      });
      const formattedMobile = smsResult.mobile || existing.mobile;

      return NextResponse.json({
        success: true,
        smsSent: smsResult.sent,
        smsReason: smsResult.gatewayReason || null,
        smsMessage: smsResult.messageText || null,
        smsUri: smsResult.smsUri || null,
        whatsappUri: smsResult.whatsappUri || null,
        formattedMobile,
        message: smsResult.sent
          ? `SMS with Membership ID (${existing.membershipId}) & Password (${existing.memberPassword}) delivered to ${formattedMobile}.`
          : `Ready to send SMS to ${formattedMobile} (Membership ID: ${existing.membershipId} | Password: ${existing.memberPassword}).`,
        member: existing,
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
