import crypto from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'mudiraj_admin_session';
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  'mudiraj-community-ap-secret-key-2026-prod-ready-v1';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

/**
 * Hashes a plain-text password using Node's built-in scrypt KDF.
 */
export function hashPassword(password, existingSalt = null) {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}

/**
 * Verifies a plain-text password against a stored hash and salt using timingSafeEqual.
 */
export function verifyPassword(password, storedHash, storedSalt) {
  if (!password || !storedHash || !storedSalt) return false;
  const { hash } = hashPassword(password, storedSalt);
  const hashBuffer = Buffer.from(hash, 'hex');
  const storedBuffer = Buffer.from(storedHash, 'hex');
  if (hashBuffer.length !== storedBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, storedBuffer);
}

/**
 * Creates a cryptographically signed session token for an authenticated admin.
 */
export function createSessionToken(adminUser) {
  const payload = {
    sub: adminUser.id,
    username: adminUser.username,
    email: adminUser.email,
    fullName: adminUser.fullName,
    role: adminUser.role || 'SUPER_ADMIN',
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
  };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

/**
 * Verifies and decodes a signed session token.
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }
  try {
    const [base64Payload, signature] = token.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(base64Payload)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current authenticated admin session from Next.js server cookies.
 */
export async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!tokenCookie || !tokenCookie.value) return null;
    return verifySessionToken(tokenCookie.value);
  } catch {
    return null;
  }
}

/**
 * Enforces server-side Admin authorization in API routes.
 * Returns { authorized: true, admin } or { authorized: false }.
 */
export async function requireAdminAuth() {
  const admin = await getAdminSession();
  if (!admin) {
    return { authorized: false, admin: null };
  }
  return { authorized: true, admin };
}

export { SESSION_COOKIE_NAME, SESSION_TTL_MS };
