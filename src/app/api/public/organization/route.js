import { NextResponse } from 'next/server';
import { organizationService } from '@/services/organizationService';
import { teamService } from '@/services/teamService';
import { memberService } from '@/services/memberService';

/**
 * Public Organization & Leadership Information API
 * ------------------------------------------------
 * Returns active Andhra Pradesh hierarchy (State -> District -> Constitution -> Mandal -> Gramam)
 * and public leadership teams without exposing sensitive member ID numbers.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orgLevel = searchParams.get('orgLevel') || '';
  const orgId = searchParams.get('orgId') || '';
  const teamType = searchParams.get('teamType') || '';
  const districtId = searchParams.get('districtId') || '';

  const hierarchy = organizationService.getHierarchy({ includeInactive: false });
  const teams = teamService.getTeams({
    orgLevel,
    orgId,
    teamType,
    districtId,
  });
  const leaders = teamService.getLeadersDirectory({
    orgLevel,
    teamType,
    districtId,
  });
  const stats = memberService.getDashboardAndReportStats().summary;

  return NextResponse.json({
    hierarchy,
    teams,
    leaders,
    publicStats: {
      totalMembers: stats.totalMembers,
      activeMembers: stats.activeMembers,
      totalDistricts: stats.activeDistricts,
      totalConstitutions: stats.activeConstitutions,
      totalMandals: stats.activeMandals,
      totalTeams: stats.totalTeams,
      totalLeaders: stats.totalLeaders,
    },
  });
}
