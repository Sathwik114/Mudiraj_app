/**
 * Validation & Sanitization Utilities
 * -----------------------------------
 * Provides server-side and client-side validation for:
 * - Public Membership Applications
 * - Member Records
 * - Organizational Hierarchy Units
 * - Team Leadership Assignments
 */

export const VALID_GENDERS = ['Male', 'Female', 'Other'];

export const VALID_BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'
];

export const VALID_ID_TYPES = [
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

/**
 * Validates an Indian 10-digit mobile number.
 */
export function isValidMobile(mobile) {
  if (!mobile) return false;
  const cleaned = String(mobile).trim().replace(/\s+/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validates email format.
 */
export function isValidEmail(email) {
  if (!email) return true; // Optional unless specified
  const cleaned = String(email).trim();
  if (!cleaned) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
}

/**
 * Validates a 6-digit Indian Pincode.
 */
export function isValidPincode(pincode) {
  if (!pincode) return false;
  return /^\d{6}$/.test(String(pincode).trim());
}

/**
 * Validates Date of Birth (must be a valid past date and member must be at least 15 years old and <= 110 years).
 */
export function validateDateOfBirth(dob) {
  if (!dob) return { valid: false, message: 'Date of Birth is required.' };
  const parsed = new Date(dob);
  if (Number.isNaN(parsed.getTime())) {
    return { valid: false, message: 'Invalid Date of Birth format.' };
  }
  const now = new Date();
  if (parsed > now) {
    return { valid: false, message: 'Date of Birth cannot be in the future.' };
  }
  let age = now.getFullYear() - parsed.getFullYear();
  const m = now.getMonth() - parsed.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < parsed.getDate())) {
    age -= 1;
  }
  if (age < 15) {
    return { valid: false, message: 'Applicant must be at least 15 years old.' };
  }
  if (age > 115) {
    return { valid: false, message: 'Please enter a valid Date of Birth.' };
  }
  return { valid: true, age };
}

/**
 * Validates government ID number format according to selected ID Type.
 */
export function validateGovernmentId(idType, idNumber) {
  if (!idType || !VALID_ID_TYPES.includes(idType)) {
    return { valid: false, message: 'Please select a valid ID Type.' };
  }
  if (!idNumber || !String(idNumber).trim()) {
    return { valid: false, message: 'ID Number is required.' };
  }
  const cleaned = String(idNumber).trim().toUpperCase().replace(/\s+/g, '');

  if (idType === 'Aadhaar Card') {
    if (!/^[2-9]{1}[0-9]{11}$/.test(cleaned)) {
      return { valid: false, message: 'Aadhaar Number must be 12 digits and cannot start with 0 or 1.' };
    }
  } else if (idType === 'PAN Card') {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleaned)) {
      return { valid: false, message: 'PAN Number must follow standard 10-character format (e.g., ABCDE1234F).' };
    }
  } else if (idType === 'Voter ID (EPIC)') {
    if (cleaned.length < 6 || cleaned.length > 16) {
      return { valid: false, message: 'Voter ID must be between 6 and 16 alphanumeric characters.' };
    }
  } else if (cleaned.length < 5 || cleaned.length > 24) {
    return { valid: false, message: 'ID Number must be between 5 and 24 characters.' };
  }

  return { valid: true, cleaned };
}

/**
 * Masks sensitive ID Numbers so they are never exposed in full on public endpoints.
 */
export function maskIdNumber(idNumber) {
  if (!idNumber) return '****';
  const str = String(idNumber).trim().replace(/\s+/g, '');
  if (str.length <= 4) return '****';
  return `${'*'.repeat(Math.max(4, str.length - 4))}${str.slice(-4)}`;
}

/**
 * Validates full membership application payload.
 */
export function validateMembershipApplication(payload) {
  const errors = {};

  if (!payload.fullName || String(payload.fullName).trim().length < 3) {
    errors.fullName = 'Full Name is required (minimum 3 characters).';
  }

  if (!payload.gender || !VALID_GENDERS.includes(payload.gender)) {
    errors.gender = 'Please select a valid Gender.';
  }

  if (!payload.bloodGroup || !VALID_BLOOD_GROUPS.includes(payload.bloodGroup)) {
    errors.bloodGroup = 'Blood Group is mandatory. Please select a valid option.';
  }

  if (!isValidMobile(payload.mobile)) {
    errors.mobile = 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
  }

  if (payload.alternateMobile && String(payload.alternateMobile).trim() !== '') {
    if (!isValidMobile(payload.alternateMobile)) {
      errors.alternateMobile = 'Alternate Mobile Number must be a valid 10-digit number.';
    } else if (String(payload.alternateMobile).trim() === String(payload.mobile).trim()) {
      errors.alternateMobile = 'Alternate Mobile Number cannot be identical to Primary Mobile Number.';
    }
  }

  if (!payload.email || !String(payload.email).trim() || !isValidEmail(payload.email)) {
    errors.email = 'Please enter a valid email address to receive your Membership ID and Password.';
  }

  // Address checks
  if (!payload.street || String(payload.street).trim().length < 2) {
    errors.street = 'Street / Colony Name is required.';
  }
  if (!isValidPincode(payload.pincode)) {
    errors.pincode = 'Enter a valid 6-digit Pincode.';
  }

  // ID Details checks
  const idCheck = validateGovernmentId(payload.idType || 'Aadhaar Card', payload.idNumber);
  if (!idCheck.valid) {
    errors.idNumber = idCheck.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
