import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { teamService } from '@/services/teamService';

export async function GET(request) {
  const { authorized } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized administrator access.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orgLevel = searchParams.get('orgLevel') || '';
  const orgId = searchParams.get('orgId') || '';
  const teamType = searchParams.get('teamType') || '';
  const districtId = searchParams.get('districtId') || '';
  const constitutionId = searchParams.get('constitutionId') || '';
  const mandalId = searchParams.get('mandalId') || '';
  const search = searchParams.get('search') || '';

  if (orgLevel && orgId) {
    teamService.ensureTeamsExist({ orgLevel, orgId });
  }

  const teams = teamService.getTeams({
    orgLevel,
    orgId,
    teamType,
    districtId,
    constitutionId,
    mandalId,
    search,
  });

  return NextResponse.json({ teams });
}

export async function PATCH(request) {
  const { authorized, admin } = await requireAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized administrator access.' }, { status: 401 });
  }

  try {
    const { teamId, executiveMemberLimit } = await request.json();
    const updatedTeam = teamService.setExecutiveCapacity({
      teamId,
      executiveMemberLimit,
      actor: admin.username,
    });
    return NextResponse.json({
      success: true,
      message: `Executive Member positions capacity updated to ${updatedTeam.executiveMemberLimit}.`,
      team: updatedTeam,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to update team settings.' },
      { status: 400 }
    );
  }
}
