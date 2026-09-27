import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { organizationService } from '@/services/organizationService';

export async function GET() {
  const { authorized } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized administrator access.' }, { status: 401 });
  }

  const hierarchy = organizationService.getHierarchy({ includeInactive: true });
  return NextResponse.json({ hierarchy });
}

export async function POST(request) {
  const { authorized, admin } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized administrator access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const unit = organizationService.createUnit({
      ...body,
      actor: admin.username,
    });
    return NextResponse.json(
      {
        success: true,
        message: `Organization Unit "${unit.name}" created and 3 leadership teams initialized.`,
        unit,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to create organization unit.' }, { status: 400 });
  }
}

export async function PATCH(request) {
  const { authorized, admin } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized administrator access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const unit = organizationService.updateUnit({
      ...body,
      actor: admin.username,
    });
    return NextResponse.json({
      success: true,
      message: `Organization Unit "${unit.name}" updated successfully.`,
      unit,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to update organization unit.' }, { status: 400 });
  }
}
