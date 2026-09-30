import {
  queryTeams,
  ensureTeamsForOrganization,
  updateTeamExecutiveCapacity,
  assignLeaderToTeam,
  changeLeaderPosition,
  removeLeaderFromTeam,
  queryAllLeaders,
} from '@/lib/teams';

/**
 * Team & Leadership Service (`services/teamService.js`)
 * -----------------------------------------------------
 * Reusable team management across Main Team, Youth Team, and Mahila Team
 * for State, District, Constitution, Mandal, and Gramam levels.
 */

export const teamService = {
  getTeams(filters = {}) {
    return queryTeams(filters);
  },

  ensureTeamsExist({ orgLevel, orgId }) {
    return ensureTeamsForOrganization({ orgLevel, orgId });
  },

  setExecutiveCapacity({ teamId, executiveMemberLimit, actor }) {
    return updateTeamExecutiveCapacity({ teamId, executiveMemberLimit, actor });
  },

  assignLeader({ teamId, memberId, positionCode, actor }) {
    return assignLeaderToTeam({ teamId, memberId, positionCode, actor });
  },

  updateLeaderRole({ teamMemberId, newPositionCode, actor }) {
    return changeLeaderPosition({ teamMemberId, newPositionCode, actor });
  },

  removeLeader({ teamMemberId, actor }) {
    return removeLeaderFromTeam({ teamMemberId, actor });
  },

  getLeadersDirectory(filters = {}) {
    return queryAllLeaders(filters);
  },
};
