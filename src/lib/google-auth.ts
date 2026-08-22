import bcrypt from 'bcryptjs';
import { store } from './store';

// ponytail: minimal Google OAuth 2.0 (Authorization Code flow) — no heavy SDK needed.
// Env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI.

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export function googleClientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new Error('GOOGLE_CLIENT_ID belum dikonfigurasi');
  return id;
}

export function googleRedirectUri(): string {
  const configured = process.env.GOOGLE_REDIRECT_URI;
  if (configured) return configured;
  const base = process.env.SITE_URL || 'http://localhost:3000';
  return `${base}/api/auth/google/callback`;
}

/** Build the Google consent-screen URL (redirects the browser to Google). */
export function googleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: googleClientId(),
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

/** Exchange the authorization code for a token, then fetch the user's profile. */
export async function exchangeGoogleCode(code: string): Promise<GoogleUserInfo> {
  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: googleClientId(),
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: googleRedirectUri(),
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) {
    throw new Error('Gagal menukar kode Google');
  }
  const tokenData = await tokenRes.json();
  const accessToken: string = tokenData.access_token;
  if (!accessToken) throw new Error('Tidak ada access token dari Google');

  const infoRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!infoRes.ok) throw new Error('Gagal mengambil profil Google');
  const info: GoogleUserInfo = await infoRes.json();
  return info;
}

/**
 * Find or create a user by Google email. If the email already exists in our DB
 * (registered with a password), we just log that account in. Otherwise we create
 * a new user with a random unguessable password (Google will handle auth).
 */
export async function createOrLoginGoogleUser(info: GoogleUserInfo) {
  const email = (info.email || '').trim().toLowerCase();
  if (!email) throw new Error('Akun Google tidak memiliki email');

  let user = await store.getUserByEmail(email);
  if (!user) {
    const randomPassword = await bcrypt.hash(
      `google-${info.id}-${Math.random().toString(36).slice(2)}-${Date.now()}`,
      12
    );
    user = await store.createUser({
      name: info.name || email.split('@')[0] || 'Google User',
      email,
      password: randomPassword,
      phone: '',
      address: '',
      city: '',
      postalCode: '',
    });
  }
  return user;
}
