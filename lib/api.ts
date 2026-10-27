import axios, { AxiosInstance, AxiosError } from 'axios';
import { Preferences } from '@capacitor/preferences';

// NEXT_PUBLIC_API_URL is baked in at build time (see .env.example).
//  - Android emulator  -> http://10.0.2.2:8000/api   (10.0.2.2 = the host machine)
//  - Physical device   -> http://<your-LAN-IP>:8000/api
//  - Production        -> https://api.vaishnav-vivaah.com/api
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.0.2.2:8000/api';

// A production bundle must talk to the API over HTTPS. Development bundles
// (`npm run build:android`) opt out explicitly via NEXT_PUBLIC_ALLOW_INSECURE_API=true,
// so a release build can never silently ship with an http:// development URL.
if (
  process.env.NODE_ENV === 'production' &&
  !/^https:\/\//i.test(API_URL) &&
  process.env.NEXT_PUBLIC_ALLOW_INSECURE_API !== 'true'
) {
  throw new Error(
    `Refusing to build: NEXT_PUBLIC_API_URL must be https:// for production (got "${API_URL}"). ` +
      'For emulator/device testing use `npm run build:android`.'
  );
}

// Helper function for cross-platform token storage
export const getStorageValue = async (key: string): Promise<string | null> => {
  try {
    // Try Capacitor Preferences (Android/iOS)
    const { value } = await Preferences.get({ key });
    if (value) return value;
  } catch (e) {
    // Fallback to localStorage (web)
  }

  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setStorageValue = async (key: string, value: string): Promise<void> => {
  try {
    // Try Capacitor Preferences (Android/iOS)
    await Preferences.set({ key, value });
  } catch (e) {
    // Fallback to localStorage (web)
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeStorageValue = async (key: string): Promise<void> => {
  try {
    // Try Capacitor Preferences (Android/iOS)
    await Preferences.remove({ key });
  } catch (e) {
    // Fallback to localStorage (web)
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getStorageValue('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Only one refresh may be in flight at a time. The server rotates *and blacklists* the
// refresh token, so parallel 401s that each tried to refresh would reuse an already-spent
// token, fail, and log the user out.
let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await getStorageValue('refresh_token');
  if (!refreshToken) throw new Error('No refresh token');
  const response = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh: refreshToken });
  const { access, refresh } = response.data;
  await setStorageValue('access_token', access);
  // ROTATE_REFRESH_TOKENS=True: the server issues a new refresh token each time
  if (refresh) await setStorageValue('refresh_token', refresh);
  return access;
}

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const hasRefresh = !!(await getStorageValue('refresh_token'));
      if (!hasRefresh) return Promise.reject(error);

      try {
        refreshInFlight ??= refreshAccessToken().finally(() => {
          refreshInFlight = null;
        });
        const access = await refreshInFlight;
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        await removeStorageValue('access_token');
        await removeStorageValue('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/** DRF list endpoints are paginated ({count, results}); the UI wants plain arrays. */
export function unwrapList<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

/**
 * One-line, log-safe description of an error. Never use `console.error(error)` on an axios error:
 * it prints `config.data` (the OTP) and `config.headers.Authorization` (the access token).
 */
export function describeError(error: unknown): string {
  const err = error as AxiosError<any>;
  if (err?.response) return `HTTP ${err.response.status}: ${getErrorMessage(error)}`;
  if (err?.request || err?.code === 'ERR_NETWORK') return 'network error (no response)';
  return (error as Error)?.message || 'unknown error';
}

/** Turn an axios/DRF error into a message a person can read. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const err = error as AxiosError<any>;
  if (err?.response) {
    const d = err.response.data;
    if (typeof d === 'string' && !d.trimStart().startsWith('<')) return d;
    if (d?.error) return String(d.error);
    if (d?.detail) return String(d.detail);
    if (d && typeof d === 'object') {
      const first = Object.entries(d)[0];
      if (first) {
        const [field, msg] = first as [string, any];
        return `${field.replace(/_/g, ' ')}: ${Array.isArray(msg) ? msg[0] : msg}`;
      }
    }
    return `Server error (${err.response.status}). Please try again.`;
  }
  if (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT') return 'The server took too long to respond. Please try again.';
  if (err?.request || err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
    return 'Cannot reach the server. Check your internet connection.';
  }
  return (error as Error)?.message || fallback;
}

export default apiClient;
