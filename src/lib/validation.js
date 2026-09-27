/**
 * Validation & Sanitization Utilities
 * -----------------------------------
 * Streamlined member validation for:
 * Full Name, Gender, Mobile Number, Email Address, Passport, PinCode,
 * Team Type, and conditional cascading State / District / Constituency / Mandal selection.
 */

export const VALID_GENDERS = ['Male', 'Female', 'Other'];

export const MEMBER_TEAM_TYPE_OPTIONS = [
  'State',
  'District',
  'Constituency',
  'Mandal Main',
  'Mandal Youth',
  'Mandal Mahila',
];

export const VALID_ID_TYPES = [
  'Passport',
  'Aadhaar Card',
  'Voter ID (EPIC)',
  'PAN Card',
  'Driving License',
  'Ration Card',
];

export const VALID_MEMBERSHIP_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
  'Active',
  'Inactive',
];

export const VALID_ORG_LEVELS = [
  'State',
  'District',
  'Constitution',
  'Mandal',
  'Gramam',
];

export const VALID_TEAM_TYPES = [
  'Main Team',
  'Youth Team',
  'Mahila Team',
];

export const DEFAULT_TEAM_POSITIONS = [
  { code: 'PRESIDENT', title: 'President / Chairman', maxCount: 1, isFixed: true, sortOrder: 1 },
  { code: 'VICE_PRESIDENT', title: 'Vice President', maxCount: 6, isFixed: true, sortOrder: 2 },
  { code: 'GENERAL_SECRETARY', title: 'General Secretary', maxCount: 2, isFixed: true, sortOrder: 3 },
  { code: 'SECRETARY', title: 'Secretary', maxCount: 6, isFixed: true, sortOrder: 4 },
  { code: 'TREASURER', title: 'Treasurer', maxCount: 1, isFixed: true, sortOrder: 5 },
  { code: 'EXECUTIVE_MEMBER', title: 'Executive Member', maxCount: 14, isFixed: false, sortOrder: 6 },
];

export function isValidMobile(mobile) {
  if (!mobile) return false;
  const cleaned = String(mobile).trim().replace(/\s+/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

export function isValidEmail(email) {
  if (!email) return false;
  const cleaned = String(email).trim();
  if (!cleaned) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
}

export function isValidPincode(pincode) {
  if (!pincode) return false;
  return /^\d{6}$/.test(String(pincode).trim());
}

export function maskIdNumber(idNumber) {
  if (!idNumber) return '****';
  const str = String(idNumber).trim().replace(/\s+/g, '');
  if (str.length <= 4) return '****';
  return `${'*'.repeat(Math.max(4, str.length - 4))}${str.slice(-4)}`;
}

/**
 * Validates membership application / member registration payload
 * including conditional State -> District -> Constituency -> Mandal fields based on Team Type.
 */
export function validateMembershipApplication(payload) {
  const errors = {};

  if (!payload.fullName || String(payload.fullName).trim().length < 2) {
    errors.fullName = 'Full Name is required (minimum 2 characters).';
  }

  if (!payload.gender || !VALID_GENDERS.includes(payload.gender)) {
    errors.gender = 'Please select a valid Gender.';
  }

  if (!isValidMobile(payload.mobile)) {
    errors.mobile = 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
  }

  if (!isValidEmail(payload.email)) {
    errors.email = 'Please enter a valid Email Address.';
  }

  if (!isValidPincode(payload.pincode)) {
    errors.pincode = 'Enter a valid 6-digit PinCode.';
  }

  const teamType = payload.memberTeamType ? String(payload.memberTeamType).trim() : '';
  if (!teamType) {
    errors.memberTeamType = 'Please select a Team Type.';
  } else {
    if (!payload.stateName || !String(payload.stateName).trim()) {
      errors.stateName = 'Please select a State.';
    }

    if (
      ['District', 'Constituency', 'Mandal Main', 'Mandal Youth', 'Mandal Mahila'].includes(
        teamType
      ) &&
      (!payload.districtName || !String(payload.districtName).trim())
    ) {
      errors.districtName = 'Please select a District.';
    }

    if (
      ['Constituency', 'Mandal Main', 'Mandal Youth', 'Mandal Mahila'].includes(teamType) &&
      (!payload.constitutionName || !String(payload.constitutionName).trim())
    ) {
      errors.constitutionName = 'Please select a Constituency.';
    }

    if (
      ['Mandal Main', 'Mandal Youth', 'Mandal Mahila'].includes(teamType) &&
      (!payload.mandalName || !String(payload.mandalName).trim())
    ) {
      errors.mandalName = 'Please select a Mandal.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
