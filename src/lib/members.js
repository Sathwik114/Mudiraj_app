import {
  getDatabase,
  saveDatabase,
  generateUuid,
  dbAdapter,
  recordAuditLog,
} from './database.js';
import { generateNextMembershipId } from './membershipId.js';
import { maskIdNumber } from './validation.js';

/**
 * Member & Application Repository Layer (`src/lib/members.js`)
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
    memberTeamType: member.memberTeamType || 'State',
    idNumber: maskSensitiveId ? maskIdNumber(member.idNumber) : member.idNumber,
    leadershipPositions: assignments,
  };
}

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
    if (districtId && m.districtId !== districtId && m.districtName !== districtId) return false;
    if (constitutionId && m.constitutionId !== constitutionId && m.constitutionName !== constitutionId) return false;
    if (mandalId && m.mandalId !== mandalId && m.mandalName !== mandalId) return false;

    if (teamType || positionCode) {
      const mAssigns = memberAssignmentsMap.get(m.id) || [];
      const matchesMemberTeamType =
        teamType &&
        (m.memberTeamType || 'State').toLowerCase() === teamType.toLowerCase();

      if (!matchesMemberTeamType) {
        if (mAssigns.length === 0) return false;
        const matchesTeamAndPos = mAssigns.some((a) => {
          if (teamType && a.teamType !== teamType) return false;
          if (positionCode && a.positionCode !== positionCode) return false;
          return true;
        });
        if (!matchesTeamAndPos) return false;
      }
    }

    if (q) {
      const matchMid = (m.membershipId || '').toLowerCase().includes(q);
      const matchAppNo = (m.applicationNo || '').toLowerCase().includes(q);
      const matchName = (m.fullName || '').toLowerCase().includes(q);
      const matchMobile = (m.mobile || '').includes(q);
      const matchEmail = (m.email || '').toLowerCase().includes(q);
      const matchPincode = (m.pincode || '').includes(q);
      const matchTeamType = (m.memberTeamType || '').toLowerCase().includes(q);
      const matchDistrict = (m.districtName || '').toLowerCase().includes(q);
      const matchConst = (m.constitutionName || '').toLowerCase().includes(q);
      const matchMandal = (m.mandalName || '').toLowerCase().includes(q);
      if (
        !matchMid &&
        !matchAppNo &&
        !matchName &&
        !matchMobile &&
        !matchEmail &&
        !matchPincode &&
        !matchTeamType &&
        !matchDistrict &&
        !matchConst &&
        !matchMandal
      ) {
        return false;
      }
    }

    return true;
  });

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

export function getMemberById(id, { maskSensitiveId = false } = {}) {
  const db = getDatabase();
  const member = db.members.find(
    (m) => m.id === id || m.membershipId === id || m.applicationNo === id
  );
  if (!member) return null;
  return enrichMemberWithLeadership(member, db, { maskSensitiveId });
}

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

  return {
    applicationNo: member.applicationNo,
    membershipId: member.membershipId,
    fullName: member.fullName,
    gender: member.gender,
    email: member.email,
    pincode: member.pincode,
    memberTeamType: member.memberTeamType || 'State',
    stateName: member.stateName || 'Andhra Pradesh',
    districtName: member.districtName || '',
    constitutionName: member.constitutionName || '',
    mandalName: member.mandalName || '',
    status: member.status,
    applicationDate: member.applicationDate,
    approvalDate: member.approvalDate,
    remarks: member.remarks,
    maskedIdNumber: maskIdNumber(member.passportNumber || member.idNumber),
    idType: member.idType || 'Passport',
  };
}

export function createMembershipApplication(payload, { autoApprove = false, actor = 'public' } = {}) {
  const db = getDatabase();
  const cleanedMobile = String(payload.mobile).trim();

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

  const teamType = payload.memberTeamType ? String(payload.memberTeamType).trim() : 'State';
  const stateName = payload.stateName ? String(payload.stateName).trim() : 'Andhra Pradesh';

  const districtName = ['District', 'Constituency', 'Mandal Main', 'Mandal Youth', 'Mandal Mahila'].includes(teamType)
    ? String(payload.districtName || '').trim()
    : '';

  const constitutionName = ['Constituency', 'Mandal Main', 'Mandal Youth', 'Mandal Mahila'].includes(teamType)
    ? String(payload.constitutionName || '').trim()
    : '';

  const mandalName = ['Mandal Main', 'Mandal Youth', 'Mandal Mahila'].includes(teamType)
    ? String(payload.mandalName || '').trim()
    : '';

  const nextAppSeq = dbAdapter.incrementSequence('applicationNo');
  const applicationNo = `APP-2026-${String(nextAppSeq).padStart(4, '0')}`;
  const now = new Date().toISOString();

  let status = 'Pending';
  let membershipId = null;
  let approvalDate = null;
  let approvedBy = null;

  if (autoApprove) {
    membershipId = generateNextMembershipId(dbAdapter);
    status = 'Active';
    approvalDate = now;
    approvedBy = actor;
  }

  const locationSummary = [mandalName, constitutionName, districtName, stateName]
    .filter(Boolean)
    .join(' › ');

  const newMember = {
    id: generateUuid('mem'),
    applicationNo,
    membershipId,
    fullName: String(payload.fullName).trim(),
    fatherName: '',
    motherName: '',
    dob: '',
    gender: payload.gender,
    mobile: cleanedMobile,
    alternateMobile: '',
    email: payload.email ? String(payload.email).trim() : '',
    photoUrl: payload.photoUrl || '',
    passportNumber: payload.passportNumber ? String(payload.passportNumber).trim().toUpperCase() : '',
    memberTeamType: teamType,
    stateId: 'state-ap',
    stateName,
    districtId: districtName,
    districtName,
    constitutionId: constitutionName,
    constitutionName,
    mandalId: mandalName,
    mandalName,
    gramamId: null,
    gramamName: '',
    houseNo: '',
    street: '',
    pincode: String(payload.pincode).trim(),
    idType: 'Passport',
    idNumber: payload.passportNumber
      ? String(payload.passportNumber).trim().toUpperCase()
      : 'PASSPORT-VERIFIED',
    status,
    applicationDate: now,
    approvalDate,
    approvedBy,
    remarks:
      payload.remarks ||
      (autoApprove
        ? `Directly registered (${teamType}: ${locationSummary})`
        : `Submitted via Public Portal (${teamType}: ${locationSummary}) - Pending Review`),
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
      ? `Admin registered & approved ${newMember.fullName} (${teamType} - ${locationSummary}) with Membership ID ${newMember.membershipId}.`
      : `Public membership application ${newMember.applicationNo} submitted by ${newMember.fullName} (${teamType} - ${locationSummary}).`,
  });

  return newMember;
}

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
    member.membershipId = generateNextMembershipId(dbAdapter);
  }
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
    details: `Approved ${member.fullName} (${member.applicationNo}). Assigned Membership ID: ${member.membershipId}. Status: ${member.status}.`,
  });

  return enrichMemberWithLeadership(member, db);
}

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

export function updateMemberRecord({ memberId, updates, actor = 'admin' }) {
  const db = getDatabase();
  const member = db.members.find((m) => m.id === memberId);
  if (!member) throw new Error('Member record not found.');

  const editableFields = [
    'fullName',
    'gender',
    'mobile',
    'email',
    'photoUrl',
    'passportNumber',
    'memberTeamType',
    'stateName',
    'districtName',
    'constitutionName',
    'mandalName',
    'pincode',
    'remarks',
  ];

  editableFields.forEach((field) => {
    if (updates[field] !== undefined) {
      member[field] = updates[field];
    }
  });

  if (updates.status && updates.status !== member.status) {
    if (['Approved', 'Active'].includes(updates.status) && !member.membershipId) {
      member.membershipId = generateNextMembershipId(dbAdapter);
      member.approvalDate = new Date().toISOString();
      member.approvedBy = actor;
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
