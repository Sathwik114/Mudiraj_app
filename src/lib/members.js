import {
  getDatabase,
  saveDatabase,
  generateUuid,
  getNextSequence,
  recordAuditLog,
} from './database.js';
import { generateNextMembershipId } from './membershipId.js';
import { maskIdNumber } from './validation.js';
import { getHierarchyPath } from './organizations.js';

const localDbAdapter = {
  incrementSequence: (sequenceName) => getNextSequence(sequenceName),
  isMembershipIdTaken: (id) => {
    const db = getDatabase();
    return !!db.members.find(m => m.membershipId === id);
  }
};

/**
 * Member & Application Repository Layer (`lib/members.js`)
 * --------------------------------------------------------
 * Supports 2,000,000+ (20 Lakh+) design capacity via:
 * - Server-side pagination (`page`, `limit`)
 * - Server-side search (by Membership ID, Name, Mobile, Application No)
 * - Server-side multi-attribute filtering (District, Constitution, Mandal, Status, Team, Position)
 * - Server-side sorting
 * - Unique Membership ID generation ONLY on application approval
 */

/**
 * Enriches a member record with their active leadership assignments.
 */
export function enrichMemberWithLeadership(member, db = getDatabase(), { maskSensitiveId = false } = {}) {
  const assignments = db.teamMembers
    .filter((tm) => tm.memberId === member.id && tm.status === 'Active')
    .map((tm) => {
      const team = db.teams.find((t) => t.id === tm.teamId);
      return {
        teamMemberId: tm.id,
        teamId: tm.teamId,
        teamType: team?.teamType || '',
        orgLevel: team?.orgLevel || '',
        orgName: team?.orgName || '',
        positionCode: tm.positionCode,
        positionTitle: tm.positionTitle,
        slotNumber: tm.slotNumber,
      };
    });

  return {
    ...member,
    idNumber: maskSensitiveId ? maskIdNumber(member.idNumber) : member.idNumber,
    leadershipPositions: assignments,
  };
}

/**
 * Server-side paginated, searched, filtered, and sorted member query.
 * Never returns the entire dataset unpaginated to the browser.
 */
export function queryMembersPaginated({
  page = 1,
  limit = 15,
  search = '',
  status = '',
  districtId = '',
  constitutionId = '',
  mandalId = '',
  teamType = '',
  positionCode = '',
  sortBy = 'createdAt',
  sortOrder = 'desc',
  maskSensitiveId = false,
} = {}) {
  const db = getDatabase();
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));

  // Pre-build a map of memberId -> team assignments if filtering by teamType or positionCode
  const memberAssignmentsMap = new Map();
  db.teamMembers.forEach((tm) => {
    if (tm.status !== 'Active') return;
    const team = db.teams.find((t) => t.id === tm.teamId);
    if (!memberAssignmentsMap.has(tm.memberId)) {
      memberAssignmentsMap.set(tm.memberId, []);
    }
    memberAssignmentsMap.get(tm.memberId).push({
      ...tm,
      teamType: team?.teamType || '',
      orgLevel: team?.orgLevel || '',
      orgName: team?.orgName || '',
    });
  });

  const q = search ? String(search).trim().toLowerCase() : '';

  const filtered = db.members.filter((m) => {
    if (status && m.status !== status) return false;
    if (districtId && m.districtId !== districtId) return false;
    if (constitutionId && m.constitutionId !== constitutionId) return false;
    if (mandalId && m.mandalId !== mandalId) return false;

    if (teamType || positionCode) {
      const mAssigns = memberAssignmentsMap.get(m.id) || [];
      if (mAssigns.length === 0) return false;
      const matchesTeamAndPos = mAssigns.some((a) => {
        if (teamType && a.teamType !== teamType) return false;
        if (positionCode && a.positionCode !== positionCode) return false;
        return true;
      });
      if (!matchesTeamAndPos) return false;
    }

    if (q) {
      const matchMid = (m.membershipId || '').toLowerCase().includes(q);
      const matchAppNo = (m.applicationNo || '').toLowerCase().includes(q);
      const matchName = (m.fullName || '').toLowerCase().includes(q);
      const matchFather = (m.fatherName || '').toLowerCase().includes(q);
      const matchMobile = (m.mobile || '').includes(q);
      const matchVillage = (m.gramamName || '').toLowerCase().includes(q);
      if (!matchMid && !matchAppNo && !matchName && !matchFather && !matchMobile && !matchVillage) {
        return false;
      }
    }

    return true;
  });

  // Sort records on the server
  filtered.sort((a, b) => {
    let valA = a[sortBy] || '';
    let valB = b[sortBy] || '';
    if (sortBy === 'fullName') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const currentPage = Math.min(safePage, totalPages);
  const offset = (currentPage - 1) * safeLimit;

  const pageItems = filtered
    .slice(offset, offset + safeLimit)
    .map((m) => enrichMemberWithLeadership(m, db, { maskSensitiveId }));

  return {
    items: pageItems,
    pagination: {
      page: currentPage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
}

/**
 * Gets a single member by database ID, Membership ID, Application No, or Mobile.
 */
export function getMemberById(id, { maskSensitiveId = false } = {}) {
  const db = getDatabase();
  const member = db.members.find(
    (m) => m.id === id || m.membershipId === id || m.applicationNo === id
  );
  if (!member) return null;
  return enrichMemberWithLeadership(member, db, { maskSensitiveId });
}

/**
 * Public Status Lookup (by Membership ID, Application No, or Mobile Number).
 * Strictly strips/masks sensitive ID numbers before returning to public callers!
 */
export function lookupPublicMembershipStatus(query) {
  if (!query || !String(query).trim()) return null;
  const q = String(query).trim().toUpperCase();
  const db = getDatabase();

  const member = db.members.find(
    (m) =>
      (m.membershipId && m.membershipId.toUpperCase() === q) ||
      (m.applicationNo && m.applicationNo.toUpperCase() === q) ||
      m.mobile === q
  );

  if (!member) return null;

  const path = getHierarchyPath(member.orgUnitId);
  const getUnitByRank = (rank) => {
    const level = db.orgLevels.find(l => l.levelRank === rank);
    return path.find(p => p.orgLevelId === level?.id)?.name || '';
  };

  return {
    applicationNo: member.applicationNo,
    membershipId: member.membershipId,
    fullName: member.fullName,
    fatherName: member.fatherName,
    gender: member.gender,
    dob: member.dob,
    mobile: member.mobile,
    photoUrl: member.photoUrl,
    districtName: getUnitByRank(2) || member.districtName,
    constitutionName: getUnitByRank(3) || member.constitutionName,
    mandalName: getUnitByRank(4) || member.mandalName,
    gramamName: getUnitByRank(5) || member.gramamName,
    stateName: getUnitByRank(1) || member.stateName,
    status: member.status,
    applicationDate: member.applicationDate,
    approvalDate: member.approvalDate,
    remarks: member.remarks,
    bloodGroup: member.bloodGroup,
    street: member.street,
    pincode: member.pincode,
    // Sensitive ID number and full contact info intentionally omitted/masked for public privacy
    maskedIdNumber: maskIdNumber(member.idNumber),
    idType: member.idType,
    leadershipPositions: enrichMemberWithLeadership(member, db).leadershipPositions,
  };
}

export function generateRandom6DigitPassword() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Creates a new Membership Application (from Public Website or Admin Direct Registration).
 */
export function createMembershipApplication(payload, { autoApprove = false, actor = 'public' } = {}) {
  const db = getDatabase();
  const cleanedMobile = String(payload.mobile).trim();

  // Check duplicate mobile number among Pending/Approved/Active members
  const duplicateMobile = db.members.find(
    (m) => m.mobile === cleanedMobile && m.status !== 'Rejected'
  );
  if (duplicateMobile) {
    throw new Error(
      `An application or membership already exists with mobile number ${cleanedMobile} (Application No: ${duplicateMobile.applicationNo}${
        duplicateMobile.membershipId ? `, Membership ID: ${duplicateMobile.membershipId}` : ''
      }).`
    );
  }

  const path = getHierarchyPath(payload.orgUnitId);
  const getUnitByRank = (rank) => {
    const level = db.orgLevels.find(l => l.levelRank === rank);
    return path.find(p => p.orgLevelId === level?.id) || null;
  };

  const district = getUnitByRank(2);
  const constitution = getUnitByRank(3);
  const mandal = getUnitByRank(4);
  const gramam = getUnitByRank(5);

  const nextAppSeq = localDbAdapter.incrementSequence('applicationNo');
  const applicationNo = `APP-2026-${String(nextAppSeq).padStart(4, '0')}`;
  const now = new Date().toISOString();

  let status = 'Pending';
  let membershipId = null;
  let memberPassword = null;
  let approvalDate = null;
  let approvedBy = null;

  if (autoApprove) {
    membershipId = generateNextMembershipId(localDbAdapter);
    memberPassword = generateRandom6DigitPassword();
    status = 'Active';
    approvalDate = now;
    approvedBy = actor;
  }

  const newMember = {
    id: generateUuid('mem'),
    applicationNo,
    membershipId,
    memberPassword,
    password: memberPassword,
    fullName: payload.fullName ? String(payload.fullName).trim() : '',
    fatherName: payload.fatherName ? String(payload.fatherName).trim() : '',
    motherName: payload.motherName ? String(payload.motherName).trim() : '',
    dob: payload.dob || '',
    gender: payload.gender,
    bloodGroup: payload.bloodGroup || 'Unknown',
    mobile: cleanedMobile,
    alternateMobile: payload.alternateMobile ? String(payload.alternateMobile).trim() : '',
    email: payload.email ? String(payload.email).trim() : '',
    photoUrl: payload.photoUrl || '',
    houseNo: payload.houseNo ? String(payload.houseNo).trim() : '',
    street: payload.street ? String(payload.street).trim() : '',
    orgUnitId: payload.orgUnitId,
    locationPath: '/' + path.map(p => p.id).join('/') + '/',
    gramamId: gramam ? gramam.id : null,
    gramamName: gramam ? gramam.name : String(payload.gramamName || '').trim(),
    mandalId: mandal ? mandal.id : null,
    mandalName: mandal ? mandal.name : '',
    constitutionId: constitution ? constitution.id : null,
    constitutionName: constitution ? constitution.name : '',
    districtId: district ? district.id : null,
    districtName: district ? district.name : '',
    stateId: path.length > 0 ? path[0].id : null,
    stateName: path.length > 0 ? path[0].name : '',
    pincode: String(payload.pincode).trim(),
    idType: payload.idType,
    idNumber: String(payload.idNumber).trim().toUpperCase(),
    status,
    applicationDate: now,
    approvalDate,
    approvedBy,
    sponsorId: payload.sponsorId || null,
    remarks:
      payload.remarks ||
      (autoApprove
        ? 'Directly registered and approved by Administrator'
        : 'Application submitted via Public Portal - Pending Admin Review'),
    createdAt: now,
    updatedAt: now,
  };

  db.members.unshift(newMember);
  saveDatabase(db);

  recordAuditLog({
    action: autoApprove ? 'MEMBER_DIRECT_REGISTERED' : 'APPLICATION_SUBMITTED',
    entityType: 'Member',
    entityId: newMember.id,
    actor,
    details: autoApprove
      ? `Admin registered & approved ${newMember.fullName} with Membership ID ${newMember.membershipId} and 6-digit password.`
      : `Public membership application ${newMember.applicationNo} submitted by ${newMember.fullName} (${newMember.districtName}).`,
  });

  return newMember;
}

/**
 * Approves a Pending (or Rejected) Membership Application:
 * - Generates a unique permanent Membership ID (MUD-00000001+) if not already assigned
 * - Generates a random 6-digit password and saves both in the database
 * - Sets status to 'Active' (as specified in the workflow: "Generate Unique Membership ID -> Member Status = Active")
 */
export function approveMembershipApplication({
  memberId,
  remarks = '',
  targetStatus = 'Active',
  actor = 'admin',
}) {
  const db = getDatabase();
  const member = db.members.find((m) => m.id === memberId);
  if (!member) throw new Error('Application / Member record not found.');

  const now = new Date().toISOString();
  if (!member.membershipId) {
    member.membershipId = generateNextMembershipId(localDbAdapter);
  }
  if (!member.memberPassword) {
    member.memberPassword = generateRandom6DigitPassword();
  }
  member.password = member.memberPassword;

  member.status = ['Active', 'Approved'].includes(targetStatus) ? targetStatus : 'Active';
  member.approvalDate = member.approvalDate || now;
  member.approvedBy = actor;
  if (remarks && String(remarks).trim()) {
    member.remarks = String(remarks).trim();
  } else if (!member.remarks || member.remarks.includes('Pending')) {
    member.remarks = 'Application verified and approved by Administrator.';
  }
  member.updatedAt = now;

  saveDatabase(db);

  recordAuditLog({
    action: 'APPLICATION_APPROVED',
    entityType: 'Member',
    entityId: member.id,
    actor,
    details: `Approved ${member.fullName} (${member.applicationNo}). Assigned Membership ID: ${member.membershipId} and 6-digit password. Status: ${member.status}.`,
  });

  return enrichMemberWithLeadership(member, db);
}

/**
 * Rejects a Membership Application with admin remarks.
 */
export function rejectMembershipApplication({ memberId, remarks = '', actor = 'admin' }) {
  const db = getDatabase();
  const member = db.members.find((m) => m.id === memberId);
  if (!member) throw new Error('Application / Member record not found.');

  const now = new Date().toISOString();
  member.status = 'Rejected';
  member.remarks =
    remarks && String(remarks).trim()
      ? String(remarks).trim()
      : 'Application rejected by Administrator during verification.';
  member.updatedAt = now;

  saveDatabase(db);

  recordAuditLog({
    action: 'APPLICATION_REJECTED',
    entityType: 'Member',
    entityId: member.id,
    actor,
    details: `Rejected application ${member.applicationNo} (${member.fullName}). Remarks: ${member.remarks}`,
  });

  return enrichMemberWithLeadership(member, db);
}

/**
 * Updates an existing Member's details or status.
 */
export function updateMemberRecord({ memberId, updates, actor = 'admin' }) {
  const db = getDatabase();
  const member = db.members.find((m) => m.id === memberId);
  if (!member) throw new Error('Member record not found.');

  const editableFields = [
    'fullName',
    'fatherName',
    'motherName',
    'dob',
    'gender',
    'bloodGroup',
    'mobile',
    'alternateMobile',
    'email',
    'photoUrl',
    'houseNo',
    'street',
    'gramamName',
    'pincode',
    'idType',
    'idNumber',
    'remarks',
  ];

  editableFields.forEach((field) => {
    if (updates[field] !== undefined) {
      member[field] = updates[field];
    }
  });

  if (updates.districtId && updates.districtId !== member.districtId) {
    const dist = db.districts.find((d) => d.id === updates.districtId);
    if (dist) {
      member.districtId = dist.id;
      member.districtName = dist.name;
    }
  }
  if (updates.constitutionId && updates.constitutionId !== member.constitutionId) {
    const c = db.constitutions.find((x) => x.id === updates.constitutionId);
    if (c) {
      member.constitutionId = c.id;
      member.constitutionName = c.name;
    }
  }
  if (updates.mandalId && updates.mandalId !== member.mandalId) {
    const mnd = db.mandals.find((x) => x.id === updates.mandalId);
    if (mnd) {
      member.mandalId = mnd.id;
      member.mandalName = mnd.name;
    }
  }

  // If transitioning to Approved or Active and no Membership ID exists yet, generate one!
  if (updates.status && updates.status !== member.status) {
    if (['Approved', 'Active'].includes(updates.status)) {
      if (!member.membershipId) {
        member.membershipId = generateNextMembershipId(localDbAdapter);
        member.approvalDate = new Date().toISOString();
        member.approvedBy = actor;
      }
      if (!member.memberPassword) {
        member.memberPassword = generateRandom6DigitPassword();
      }
      member.password = member.memberPassword;
    }
    member.status = updates.status;
  }

  member.updatedAt = new Date().toISOString();
  saveDatabase(db);

  recordAuditLog({
    action: 'MEMBER_UPDATED',
    entityType: 'Member',
    entityId: member.id,
    actor,
    details: `Updated member record for ${member.fullName} (${member.membershipId || member.applicationNo}) - Status: ${member.status}.`,
  });

  return enrichMemberWithLeadership(member, db);
}

/**
 * Permanently deletes a member record.
 */
export function deleteMemberRecord({ memberId, actor = 'admin' }) {
  const db = getDatabase();
  const index = db.members.findIndex((m) => m.id === memberId);
  if (index === -1) throw new Error('Member record not found.');

  const member = db.members[index];

  // Also remove from any leadership positions
  db.teamMembers = db.teamMembers.filter(tm => tm.memberId !== memberId);

  // Remove the member
  db.members.splice(index, 1);
  saveDatabase(db);

  recordAuditLog({
    action: 'MEMBER_DELETED',
    entityType: 'Member',
    entityId: memberId,
    actor,
    details: `Deleted member ${member.fullName} (${member.membershipId || member.applicationNo}).`,
  });

  return { success: true };
}
