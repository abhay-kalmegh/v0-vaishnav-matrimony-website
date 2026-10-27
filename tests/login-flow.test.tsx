/**
 * OTP login -> navigation. Runs the real login page, AuthProvider, ProtectedRoute and API client.
 * Regression target: a login must never end up on /register?step=family unless the account truly needs onboarding,
 * and a failed OTP must never navigate anywhere or leave the user "authenticated".
 */
import { cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import {
  OTP, PHONE, finalUrl, mount, nav, responses, screen, seedTokens, settle, setup, signIn, storedAccess, storedRefresh, waitFor,
} from './helpers/harness';

afterEach(async () => {
  cleanup();
  await Preferences.clear();
});

const sendOk = (mock: any) => mock.onPost('/auth/send-otp/').reply(200, { message: 'OTP sent successfully', otp: OTP });
const verifyBodies = (mock: any) => mock.history.post.filter((r: any) => r.url === '/auth/verify-otp/');

describe('successful OTP verification', () => {
  it('existing user with a complete profile goes straight to the dashboard (no detour)', async () => {
    const { mock } = setup();
    sendOk(mock);
    mock.onPost('/auth/verify-otp/').reply(200, responses.existingComplete);
    mount();
    await signIn();
    expect(await screen.findByText('DASHBOARD')).toBeTruthy();
    await settle();
    expect(finalUrl()).toBe('/dashboard');
    expect(nav.history.map((h) => h.url)).toEqual(['/dashboard']); // exactly one navigation, no bounce through /register
    expect(await storedAccess()).toBe('access.jwt.value');
    expect(await storedRefresh()).toBe('refresh.jwt.value');
  });

  it('new user is sent to registration - to the wizard itself, not to a hard-coded ?step=family', async () => {
    const { mock } = setup();
    sendOk(mock);
    mock.onPost('/auth/verify-otp/').reply(200, responses.newUser);
    mount();
    await signIn();
    expect(await screen.findByText(/REGISTER-WIZARD/)).toBeTruthy();
    await settle();
    expect(finalUrl()).toBe('/register');
    expect(finalUrl()).not.toContain('step=family');
    expect(nav.history.length).toBe(1);
    expect(await storedAccess()).toBe('access.jwt.value'); // authenticated, so the wizard can save
  });

  it('existing user with an incomplete profile resumes onboarding (not the dashboard, not step=family)', async () => {
    const { mock } = setup();
    sendOk(mock);
    mock.onPost('/auth/verify-otp/').reply(200, responses.existingIncomplete);
    mount();
    await signIn();
    expect(await screen.findByText(/REGISTER-WIZARD/)).toBeTruthy();
    await settle();
    expect(finalUrl()).toBe('/register');
    expect(nav.history.every((h) => !h.url.includes('step=family'))).toBe(true);
  });

  it('a user that the server calls complete is not bounced even when is_new_user is wrong/missing', async () => {
    const { mock } = setup();
    sendOk(mock);
    const { is_new_user: _drop, ...noFlag } = responses.existingComplete as any;
    mock.onPost('/auth/verify-otp/').reply(200, noFlag);
    mount();
    await signIn();
    expect(await screen.findByText('DASHBOARD')).toBeTruthy();
    expect(finalUrl()).toBe('/dashboard');
  });

  it('sends the field names the Django serializer requires', async () => {
    const { mock } = setup();
    sendOk(mock);
    mock.onPost('/auth/verify-otp/').reply(200, responses.existingComplete);
    mount();
    await signIn();
    await screen.findByText('DASHBOARD');
    expect(JSON.parse(verifyBodies(mock)[0].data)).toEqual({ mobile_number: PHONE, otp_code: OTP });
  });
});

describe('failed verification: stay on /login, show why, never authenticate, never navigate', () => {
  const failing = async (status: number, body: any) => {
    const { mock } = setup();
    sendOk(mock);
    mock.onPost('/auth/verify-otp/').reply(status, body);
    mount();
    await signIn();
    await settle();
    return mock;
  };
  const assertStillLoggedOut = async () => {
    expect(finalUrl()).toBe('/login');
    expect(nav.history).toEqual([]); // REGRESSION: an invalid OTP must not navigate - least of all to /register
    expect(await storedAccess()).toBeNull();
    expect(await storedRefresh()).toBeNull();
    expect(screen.queryByText('DASHBOARD')).toBeNull();
    expect(screen.queryByText(/REGISTER-WIZARD/)).toBeNull();
  };

  it('invalid OTP (HTTP 400)', async () => {
    await failing(400, { error: 'Invalid OTP' });
    expect(await screen.findByText(/invalid otp/i)).toBeTruthy();
    await assertStillLoggedOut();
  });

  it('expired OTP (HTTP 400)', async () => {
    await failing(400, { error: 'OTP has expired' });
    expect(await screen.findByText(/otp has expired/i)).toBeTruthy();
    await assertStillLoggedOut();
  });

  it('HTTP 400 field error (e.g. malformed request)', async () => {
    await failing(400, { otp_code: ['This field is required.'] });
    expect(await screen.findByText(/otp code: this field is required/i)).toBeTruthy();
    await assertStillLoggedOut();
  });

  it('locked out after too many attempts (HTTP 429)', async () => {
    await failing(429, { error: 'Too many incorrect attempts. Request a new OTP.' });
    expect(await screen.findByText(/too many incorrect attempts/i)).toBeTruthy();
    await assertStillLoggedOut();
  });

  it('server error returning an HTML page shows a readable message, not markup', async () => {
    await failing(500, '<!DOCTYPE html><html><body>Server Error</body></html>');
    expect(await screen.findByText(/server error \(500\)/i)).toBeTruthy();
    expect(document.body.innerHTML).not.toContain('<!DOCTYPE');
    await assertStillLoggedOut();
  });

  it('network failure keeps the OTP step and what the user typed', async () => {
    const { mock } = setup();
    sendOk(mock);
    mock.onPost('/auth/verify-otp/').networkError();
    mount();
    await signIn();
    await settle();
    expect(await screen.findByText(/cannot reach the server/i)).toBeTruthy();
    expect((screen.getByPlaceholderText(/6-digit otp/i) as HTMLInputElement).value).toBe(OTP);
    await assertStillLoggedOut();
  });

  it('after a failure the user can correct the code and succeed', async () => {
    const { mock } = setup();
    sendOk(mock);
    mock.onPost('/auth/verify-otp/').replyOnce(400, { error: 'Invalid OTP' }).onPost('/auth/verify-otp/').reply(200, responses.existingComplete);
    mount();
    await signIn('000000');
    expect(await screen.findByText(/invalid otp/i)).toBeTruthy();
    const { default: userEvent } = await import('@testing-library/user-event');
    const u = userEvent.setup();
    const input = screen.getByPlaceholderText(/6-digit otp/i);
    await u.clear(input);
    await u.type(input, OTP);
    await u.click(screen.getByRole('button', { name: /verify|login/i }));
    expect(await screen.findByText('DASHBOARD')).toBeTruthy();
  });
});

describe('malformed authentication responses are never treated as a login', () => {
  const cases: [string, any][] = [
    ['200 without tokens', { message: 'ok', is_new_user: false, user: responses.existingComplete.user }],
    ['tokens is not an object', { ...responses.existingComplete, tokens: 'nope' }],
    ['access token missing', { ...responses.existingComplete, tokens: { refresh: 'r' } }],
    ['refresh token missing', { ...responses.existingComplete, tokens: { access: 'a' } }],
    ['non-string tokens', { ...responses.existingComplete, tokens: { access: 123, refresh: {} } }],
    ['user missing', { message: 'ok', tokens: responses.existingComplete.tokens }],
    ['empty body', ''],
  ];
  it.each(cases)('%s', async (_name, body) => {
    const { mock } = setup();
    sendOk(mock);
    mock.onPost('/auth/verify-otp/').reply(200, body);
    mount();
    await signIn();
    await settle();
    expect(finalUrl()).toBe('/login');
    expect(nav.history).toEqual([]);
    expect(await storedAccess()).toBeNull();
    expect(screen.queryByText('DASHBOARD')).toBeNull();
    expect(document.querySelector('[class*="red"], [class*="destructive"]')).toBeTruthy(); // an error is shown
  });
});

describe('double submission', () => {
  it('pressing Verify repeatedly sends ONE request (a second would hit "OTP already used" -> HTTP 400)', async () => {
    const { mock } = setup();
    sendOk(mock);
    mock.onPost('/auth/verify-otp/').reply(() => new Promise((r) => setTimeout(() => r([200, responses.existingComplete]), 40)));
    mount();
    await signIn();
    const { default: userEvent } = await import('@testing-library/user-event');
    const u = userEvent.setup();
    const btn = screen.queryByRole('button', { name: /verify|verifying/i });
    if (btn) { await u.click(btn); await u.click(btn); }
    await screen.findByText('DASHBOARD');
    expect(verifyBodies(mock).length).toBe(1);
  });
});

describe('route guard: loading state, redirects and loops', () => {
  it('does not redirect while the stored session is still being validated', async () => {
    const { mock } = setup({ start: '/dashboard' });
    await seedTokens();
    let release!: () => void;
    mock.onGet('/auth/me/').reply(() => new Promise((r) => { release = () => r([200, responses.existingComplete.user]); }));
    mount('/dashboard');
    await settle();
    expect(screen.getByText(/loading/i)).toBeTruthy();
    expect(nav.history).toEqual([]); // no premature /login or /register while isLoading
    release();
    expect(await screen.findByText('DASHBOARD')).toBeTruthy();
    expect(nav.history).toEqual([]);
  });

  it('reloading with a valid session and a complete profile stays on the dashboard', async () => {
    const { mock } = setup({ start: '/dashboard' });
    await seedTokens();
    mock.onGet('/auth/me/').reply(200, responses.existingComplete.user);
    mount('/dashboard');
    expect(await screen.findByText('DASHBOARD')).toBeTruthy();
    expect(finalUrl()).toBe('/dashboard');
    expect(nav.history).toEqual([]);
  });

  it('reloading with an incomplete profile goes to the wizard exactly once (no loop)', async () => {
    const { mock } = setup({ start: '/dashboard' });
    await seedTokens();
    mock.onGet('/auth/me/').reply(200, responses.existingIncomplete.user);
    mount('/dashboard');
    expect(await screen.findByText(/REGISTER-WIZARD/)).toBeTruthy();
    await settle();
    expect(nav.history.length).toBe(1);
    expect(finalUrl()).toBe('/register');
  });

  it('a stored session the server rejects ends on /login (nothing to refresh with)', async () => {
    const { mock } = setup({ start: '/dashboard' });
    await seedTokens('stale', '');
    await Preferences.remove({ key: 'refresh_token' });
    localStorage.removeItem('refresh_token');
    mock.onGet('/auth/me/').reply(401);
    mount('/dashboard');
    await waitFor(() => expect(finalUrl()).toBe('/login'));
    expect(nav.history.map((h) => h.url)).toEqual(['/login']);
  });

  it('visiting a protected page with no session goes to /login once', async () => {
    setup({ start: '/dashboard' });
    mount('/dashboard');
    await waitFor(() => expect(finalUrl()).toBe('/login'));
    expect(nav.history.length).toBe(1);
  });

  it('no scenario in this file ever produces a ?step=family URL', async () => {
    const { mock } = setup();
    sendOk(mock);
    mock.onPost('/auth/verify-otp/').reply(200, responses.existingIncomplete);
    mount();
    await signIn();
    await screen.findByText(/REGISTER-WIZARD/);
    expect(nav.history.map((h) => h.url).join(' ')).not.toMatch(/step=family/);
  });
});
