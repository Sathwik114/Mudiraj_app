import {
  queryMembersPaginated,
  getMemberById,
  lookupPublicMembershipStatus,
  createMembershipApplication,
  approveMembershipApplication,
  rejectMembershipApplication,
  updateMemberRecord,
} from '@/lib/members';
import { getDatabase } from '@/lib/database';
import { validateMembershipApplication } from '@/lib/validation';

/**
 * Member & Dashboard Statistics Service (`services/memberService.js`)
 * -------------------------------------------------------------------
 * Orchestrates business validation, application workflows, and analytical reports.
 */

export const memberService = {
  getPaginatedMembers(params) {
    return queryMembersPaginated(params);
  },

  getMemberDetails(id, options) {
    return getMemberById(id, options);
  },

  checkPublicApplicationStatus(query) {
    return lookupPublicMembershipStatus(query);
  },

  submitNewApplication(payload, options = {}) {
    const validation = validateMembershipApplication(payload);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      const err = new Error(firstError || 'Validation failed.');
      err.validationErrors = validation.errors;
      throw err;
    }
    return createMembershipApplication(payload, options);
  },

  approveApplication({ memberId, remarks, targetStatus = 'Active', actor = 'admin' }) {
    return approveMembershipApplication({ memberId, remarks, targetStatus, actor });
  },

  rejectApplication({ memberId, remarks, actor = 'admin' }) {
    return rejectMembershipApplication({ memberId, remarks, actor });
  },

  updateMember({ memberId, updates, actor = 'admin' }) {
    return updateMemberRecord({ memberId, updates, actor });
  },

  /**
   * Computes comprehensive Dashboard & Report statistics on the server side.
   */
  getDashboardAndReportStats() {
    const db = getDatabase();

    const totalMembersAndApps = db.members.length;
    const pendingApplications = db.members.filter((m) => m.status === 'Pending').length;
    const approvedMembers = db.members.filter((m) => ['Approved', 'Active'].includes(m.status)).length;
    const activeMembers = db.members.filter((m) => m.status === 'Active').length;
    const inactiveMembers = db.members.filter((m) => m.status === 'Inactive').length;
    const rejectedApplications = db.members.filter((m) => m.status === 'Rejected').length;
    const registeredWithId = db.members.filter((m) => Boolean(m.membershipId)).length;

    const totalStates = db.states.filter((s) => s.status === 'Active').length;
    const totalDistricts = db.districts.length;
    const activeDistricts = db.districts.filter((d) => d.status === 'Active').length;
    const totalConstitutions = db.constitutions.length;
    const activeConstitutions = db.constitutions.filter((c) => c.status === 'Active').length;
    const totalMandals = db.mandals.length;
    const activeMandals = db.mandals.filter((m) => m.status === 'Active').length;
    const totalGramams = db.gramams.length;

    const totalTeams = db.teams.length;
    const totalLeaders = db.teamMembers.filter((tm) => tm.status === 'Active').length;

    // District-wise breakdown for reports
    const districtBreakdown = db.districts.map((dist) => {
      const distMembers = db.members.filter((m) => m.districtId === dist.id);
      const distConstitutions = db.constitutions.filter((c) => c.districtId === dist.id);
      const distMandals = db.mandals.filter((m) => m.districtId === dist.id);
      const distTeams = db.teams.filter((t) => t.districtId === dist.id || t.orgId === dist.id);
      const distTeamIds = new Set(distTeams.map((t) => t.id));
      const distLeaders = db.teamMembers.filter(
        (tm) => tm.status === 'Active' && distTeamIds.has(tm.teamId)
      );

      return {
        districtId: dist.id,
        districtName: dist.name,
        districtCode: dist.code,
        status: dist.status,
        constitutionsCount: distConstitutions.length,
        mandalsCount: distMandals.length,
        totalApplications: distMembers.length,
        activeMembers: distMembers.filter((m) => ['Active', 'Approved'].includes(m.status)).length,
        pendingApplications: distMembers.filter((m) => m.status === 'Pending').length,
        leadersCount: distLeaders.length,
      };
    });

    // Gender breakdown
    const genderBreakdown = {
      Male: db.members.filter((m) => m.gender === 'Male').length,
      Female: db.members.filter((m) => m.gender === 'Female').length,
      Other: db.members.filter((m) => m.gender === 'Other').length,
    };

    // Team category breakdown
    const teamTypeBreakdown = ['Main Team', 'Youth Team', 'Mahila Team'].map((teamType) => {
      const matchingTeams = db.teams.filter((t) => t.teamType === teamType);
      const teamIds = new Set(matchingTeams.map((t) => t.id));
      const assignedCount = db.teamMembers.filter(
        (tm) => tm.status === 'Active' && teamIds.has(tm.teamId)
      ).length;

      return {
        teamType,
        teamsCount: matchingTeams.length,
        leadersCount: assignedCount,
      };
    });

    return {
      summary: {
        totalMembers: registeredWithId,
        totalRecords: totalMembersAndApps,
        pendingApplications,
        approvedMembers,
        activeMembers,
        inactiveMembers,
        rejectedApplications,
        totalStates,
        totalDistricts,
        activeDistricts,
        totalConstitutions,
        activeConstitutions,
        totalMandals,
        activeMandals,
        totalGramams,
        totalTeams,
        totalLeaders,
        nextMembershipSequence: (db.sequences?.membershipId || 0) + 1,
        maxCapacitySupported: 2000000,
      },
      districtBreakdown,
      genderBreakdown,
      teamTypeBreakdown,
      recentApplications: db.members.slice(0, 6),
      recentAuditLogs: db.auditLogs.slice(0, 12),
    };
  },
};
