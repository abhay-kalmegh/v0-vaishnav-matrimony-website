import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it } from 'vitest';
import apiClient, { getErrorMessage, unwrapList } from '../lib/api';

const API = 'https://api.test/api';
let mock: MockAdapter; // for apiClient
let raw: MockAdapter; // for the bare axios used by the refresh call

const setTokens = async (access: string, refresh: string) => {
  await Preferences.set({ key: 'access_token', value: access });
  await Preferences.set({ key: 'refresh_token', value: refresh });
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};
const stored = async (k: string) => (await Preferences.get({ key: k })).value;

beforeEach(async () => {
  mock = new MockAdapter(apiClient);
  raw = new MockAdapter(axios);
  localStorage.clear();
  await Preferences.clear();
});

describe('request/response interceptors', () => {
  it('sends the stored access token as a Bearer header', async () => {
    await setTokens('acc-1', 'ref-1');
    mock.onGet('/auth/me/').reply((cfg) => [200, { auth: cfg.headers?.Authorization }]);
    expect((await apiClient.get('/auth/me/')).data.auth).toBe('Bearer acc-1');
  });

  it('refreshes once on 401, saves the ROTATED refresh token, and retries', async () => {
    await setTokens('expired', 'ref-1');
    let call = 0;
    mock.onGet('/auth/me/').reply((cfg) => {
      call += 1;
      return cfg.headers?.Authorization === 'Bearer fresh' ? [200, { ok: true }] : [401];
    });
    raw.onPost(`${API}/auth/token/refresh/`).reply(200, { access: 'fresh', refresh: 'ref-2' });
    expect((await apiClient.get('/auth/me/')).data.ok).toBe(true);
    expect(call).toBe(2);
    expect(await stored('access_token')).toBe('fresh');
    expect(await stored('refresh_token')).toBe('ref-2');
  });

  it('parallel 401s share ONE refresh (a rotated token can only be spent once)', async () => {
    await setTokens('expired', 'ref-1');
    mock.onGet(/\/(a|b|c)\//).reply((cfg) => (cfg.headers?.Authorization === 'Bearer fresh' ? [200, { ok: 1 }] : [401]));
    let refreshCalls = 0;
    raw.onPost(`${API}/auth/token/refresh/`).reply(() => {
      refreshCalls += 1;
      // a second use of the same refresh token would be rejected by the server
      return refreshCalls === 1 ? [200, { access: 'fresh', refresh: 'ref-2' }] : [401, { detail: 'blacklisted' }];
    });
    const results = await Promise.all([apiClient.get('/a/'), apiClient.get('/b/'), apiClient.get('/c/')]);
    expect(results.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(refreshCalls).toBe(1);
    expect(await stored('refresh_token')).toBe('ref-2');
  });

  it('clears tokens and sends the user to /login when the refresh token is rejected', async () => {
    await setTokens('expired', 'dead');
    mock.onGet('/auth/me/').reply(401);
    raw.onPost(`${API}/auth/token/refresh/`).reply(401, { detail: 'expired' });
    const hrefSetter = { href: '' };
    Object.defineProperty(window, 'location', { value: hrefSetter, writable: true });
    await expect(apiClient.get('/auth/me/')).rejects.toBeTruthy();
    expect(await stored('access_token')).toBeNull();
    expect(await stored('refresh_token')).toBeNull();
    expect(hrefSetter.href).toBe('/login');
  });

  it('does not loop forever when the retried request is still 401', async () => {
    await setTokens('expired', 'ref-1');
    let calls = 0;
    mock.onGet('/auth/me/').reply(() => ((calls += 1), [401]));
    raw.onPost(`${API}/auth/token/refresh/`).reply(200, { access: 'a2', refresh: 'r2' });
    await expect(apiClient.get('/auth/me/')).rejects.toBeTruthy();
    expect(calls).toBe(2);
  });

  it('a 401 without any refresh token just fails (nothing to refresh)', async () => {
    mock.onGet('/auth/me/').reply(401);
    await expect(apiClient.get('/auth/me/')).rejects.toBeTruthy();
    expect(raw.history.post.length).toBe(0);
  });
});

describe('helpers', () => {
  it('unwrapList handles arrays, DRF pages and junk', () => {
    expect(unwrapList([1, 2])).toEqual([1, 2]);
    expect(unwrapList({ count: 1, results: [{ a: 1 }] })).toEqual([{ a: 1 }]);
    expect(unwrapList(null)).toEqual([]);
    expect(unwrapList({ detail: 'x' })).toEqual([]);
  });

  const axiosErr = (status: number, data: any) => ({ response: { status, data }, isAxiosError: true });
  it('getErrorMessage surfaces the server text', () => {
    expect(getErrorMessage(axiosErr(400, { error: 'Invalid OTP' }))).toBe('Invalid OTP');
    expect(getErrorMessage(axiosErr(401, { detail: 'Token is invalid' }))).toBe('Token is invalid');
    expect(getErrorMessage(axiosErr(400, { first_name: ['This field is required.'] }))).toBe('first name: This field is required.');
    expect(getErrorMessage(axiosErr(429, { error: 'Please wait 30s', retry_after: 30 }))).toBe('Please wait 30s');
  });
  it('getErrorMessage never leaks HTML error pages and handles offline', () => {
    expect(getErrorMessage(axiosErr(500, '<!DOCTYPE html><html>boom</html>'))).toBe('Server error (500). Please try again.');
    expect(getErrorMessage({ request: {} })).toMatch(/Cannot reach the server/);
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
    expect(getErrorMessage(undefined, 'fallback')).toBe('fallback');
  });
});

describe('getErrorMessage: transport failures', () => {
  it('recognises axios network errors and timeouts by code, not only by .request', () => {
    expect(getErrorMessage({ code: 'ERR_NETWORK', message: 'Network Error' })).toMatch(/Cannot reach the server/);
    expect(getErrorMessage({ message: 'Network Error' })).toMatch(/Cannot reach the server/);
    expect(getErrorMessage({ code: 'ECONNABORTED', message: 'timeout of 30000ms exceeded' })).toMatch(/too long/);
  });
});

describe('describeError never leaks request data', () => {
  it('omits the OTP and tokens that axios errors carry in config', async () => {
    const { describeError } = await import('../lib/api');
    const err: any = { isAxiosError: true, message: 'Request failed', config: { data: '{"otp_code":"123456"}', headers: { Authorization: 'Bearer secret.jwt' } }, response: { status: 400, data: { error: 'Invalid OTP' } } };
    const line = describeError(err);
    expect(line).toBe('HTTP 400: Invalid OTP');
    expect(line).not.toMatch(/123456|secret|Bearer/);
  });
});
