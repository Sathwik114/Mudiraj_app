/**
 * Membership ID Generation Service
 * --------------------------------
 * Generates unique, permanent Membership IDs in the format:
 *   MUD-00000001, MUD-00000002, ...
 *
 * Designed to safely support well over 20 lakh (2,000,000) members
 * (8-digit zero-padded sequence supports up to 99,999,999 members without format change,
 * and automatically expands beyond 8 digits if needed).
 *
 * IMPORTANT:
 * - Never relies on array length or array index.
 * - Uses a persistent monotonic sequence counter in the database layer.
 * - Verifies uniqueness against existing member records before finalizing.
 */

export const MEMBERSHIP_ID_CONFIG = {
  prefix: 'MUD',
  separator: '-',
  padLength: 8, // Supports 00000001 to 99999999 (9.99 Crore > 20 Lakh requirement)
  maxCapacityGuaranteed: 2000000,
};

/**
 * Formats a numeric sequence number into a canonical Membership ID string.
 * @param {number} sequenceNumber - Positive integer sequence
 * @param {object} [customConfig] - Optional override for prefix/padding
 * @returns {string} Formatted Membership ID (e.g. "MUD-00000001")
 */
export function formatMembershipId(sequenceNumber, customConfig = {}) {
  const num = Number(sequenceNumber);
  if (!Number.isInteger(num) || num < 1) {
    throw new Error(`Invalid membership sequence number: ${sequenceNumber}`);
  }
  const prefix = customConfig.prefix || MEMBERSHIP_ID_CONFIG.prefix;
  const separator = customConfig.separator ?? MEMBERSHIP_ID_CONFIG.separator;
  const padLength = customConfig.padLength || MEMBERSHIP_ID_CONFIG.padLength;

  const paddedDigits = String(num).padStart(padLength, '0');
  return `${prefix}${separator}${paddedDigits}`;
}

/**
 * Parses a Membership ID string and extracts its numeric sequence if valid.
 * @param {string} membershipId
 * @returns {number|null}
 */
export function parseMembershipIdSequence(membershipId) {
  if (!membershipId || typeof membershipId !== 'string') return null;
  const match = membershipId.trim().toUpperCase().match(/^MUD-(\d{8,})$/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

/**
 * Generates the next guaranteed-unique Membership ID using the database sequence store.
 * Called ONLY when a membership application is approved.
 *
 * @param {object} dbAdapter - Database adapter providing getNextSequenceValue & isMembershipIdTaken
 * @returns {string} Unique Membership ID (e.g. "MUD-00000015")
 */
export function generateNextMembershipId(dbAdapter) {
  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts < maxAttempts) {
    attempts += 1;
    const nextSeq = dbAdapter.incrementSequence('membershipId');
    const candidateId = formatMembershipId(nextSeq);

    if (!dbAdapter.isMembershipIdTaken(candidateId)) {
      return candidateId;
    }
  }

  throw new Error('Unable to generate a unique Membership ID after maximum retries.');
}
