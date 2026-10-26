/**
 * Mini app: the REAL AuthProvider, login page, ProtectedRoute and API client, wired to a fake router.
 * Only the network is faked (axios-mock-adapter), with response bodies shaped exactly like the Django views return.
 */
import MockAdapter from 'axios-mock-adapter';
import { Preferences } from '@capacitor/preferences';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useEffect, useState } from 'react';
import apiClient from '../../lib/api';
import LoginPage from '../../app/login/page';
import { ProtectedRoute } from '../../lib/components/protected-route';
import { AuthProvider } from '../../lib/context/auth-context';
import { nav, pathname, search } from './router';

export const PHONE = '9876543210';
export const OTP = '123456';

const user = (over: Record<string, any> = {}) => ({
  id: 'u1', mobile_number: PHONE, email: null, first_name: 'Arjun', last_name: 'Das', full_name: 'Arjun Das',
  gender: 'male', role: 'groom', is_verified: true, date_joined: '2026-01-01T00:00:00Z',
  profile_completed: false, is_profile_complete: false, profile_completion: 0, missing_profile_fields: ['date_of_birth'],
  ...over,
});
const tokens = { access: 'access.jwt.value', refresh: 'refresh.jwt.value' };

/** Bodies as produced by VerifyOTPView (see backend tests/test_auth.py). */
export const responses = {
  newUser: { message: 'OTP verified successfully', is_new_user: true, tokens, user: user() },
  existingComplete: {
    message: 'OTP verified successfully', is_new_user: false, tokens,
    user: user({ profile_completed: true, is_profile_complete: true, profile_completion: 85, missing_profile_fields: [] }),
  },
  existingIncomplete: {
    message: 'OTP verified successfully', is_new_user: false, tokens,
    user: user({ profile_completion: 40, missing_profile_fields: ['education', 'career', 'family_type'] }),
  },
};

function Page({ url }: { url: string }) {
  const path = url.split('?')[0];
  if (path === '/login') return <LoginPage />;
  if (path === '/dashboard') return <ProtectedRoute requireProfileComplete><div>DASHBOARD</div></ProtectedRoute>;
  if (path === '/register') return <div>REGISTER-WIZARD {url.split('?')[1] ?? ''}</div>;
  return <div>OTHER {url}</div>;
}

function App({ start }: { start: string }) {
  const [url, setUrl] = useState(start);
  useEffect(() => {
    nav.listener = setUrl;
    return () => { nav.listener = () => {}; };
  }, []);
  return <AuthProvider><Page url={url} /></AuthProvider>;
}

export function setup(opts: { start?: string; tokensStored?: boolean } = {}) {
  const mock = new MockAdapter(apiClient);
  nav.reset(opts.start ?? '/login');
  localStorage.clear();
  return { mock };
}

export async function seedTokens(access = 'access.jwt.value', refresh = 'refresh.jwt.value') {
  await Preferences.set({ key: 'access_token', value: access });
  await Preferences.set({ key: 'refresh_token', value: refresh });
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}
export const storedAccess = async () => (await Preferences.get({ key: 'access_token' })).value;
export const storedRefresh = async () => (await Preferences.get({ key: 'refresh_token' })).value;

export function mount(start = '/login') {
  nav.url = start;
  return render(<App start={start} />);
}

/** Types the phone, requests the OTP, types the OTP and submits. Resolves after the submit click. */
export async function signIn(code = OTP) {
  const u = userEvent.setup();
  await u.type(await screen.findByPlaceholderText(/10-digit phone/i), PHONE);
  await u.click(screen.getByRole('button', { name: /send otp|get otp|continue/i }));
  await u.type(await screen.findByPlaceholderText(/6-digit otp/i), code);
  await u.click(screen.getByRole('button', { name: /verify|login|sign in/i }));
}

export const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 30)); });
export const finalUrl = () => nav.url;
export { nav, pathname, search, screen, waitFor, act };
