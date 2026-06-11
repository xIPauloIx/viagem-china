import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { Role } from './types';

const COOKIE = 'china_session';
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');

export interface Session { user: string; role: Role }

export function checkCredentials(user: string, pass: string): Session | null {
  if (user === process.env.EDITOR_USER && pass === process.env.EDITOR_PASS)
    return { user, role: 'editor' };
  if (user === process.env.VIEWER_USER && pass === process.env.VIEWER_PASS)
    return { user, role: 'viewer' };
  return null;
}

export async function createSessionCookie(s: Session): Promise<void> {
  const token = await new SignJWT({ user: s.user, role: s.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('120d')
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    maxAge: 120 * 24 * 3600, path: '/',
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.user && (payload.role === 'editor' || payload.role === 'viewer'))
      return { user: String(payload.user), role: payload.role };
  } catch { /* token inválido/expirado */ }
  return null;
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
