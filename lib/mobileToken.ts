// Lightweight HS256 JWT helper for the MOBILE app's token auth.
//
// The website authenticates via NextAuth cookies, which a native app can't use.
// So mobile clients call /api/mobile/login, get a signed JWT here, and send it
// back as `Authorization: Bearer <token>` on protected mobile endpoints.
//
// We sign with Node's built-in crypto (no extra dependency) using NEXTAUTH_SECRET,
// the same secret the rest of the app already relies on. These routes run in the
// Node.js runtime (they use Prisma), so `crypto` is available.

import crypto from 'crypto';

const secret = process.env.NEXTAUTH_SECRET || '';

export interface MobileTokenPayload {
  sub: string; // user id
  role: string;
  email: string;
}

function base64url(input: string): string {
  return Buffer.from(input).toString('base64url');
}

/** Signs a mobile JWT. Default lifetime: 30 days. */
export function signMobileToken(
  payload: MobileTokenPayload,
  expiresInSec = 60 * 60 * 24 * 30
): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const data = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(body))}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

/** Verifies a mobile JWT. Returns the payload, or null if invalid/expired. */
export function verifyMobileToken(token: string): MobileTokenPayload | null {
  if (!secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, bodyB64, sig] = parts;
  const data = `${headerB64}.${bodyB64}`;
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(bodyB64, 'base64url').toString());
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (!payload.sub) return null;
    return { sub: payload.sub, role: payload.role, email: payload.email };
  } catch {
    return null;
  }
}

/** Extracts and verifies the bearer token from a request's Authorization header. */
export function getMobileUser(request: Request): MobileTokenPayload | null {
  const auth =
    request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return verifyMobileToken(auth.slice(7).trim());
}
