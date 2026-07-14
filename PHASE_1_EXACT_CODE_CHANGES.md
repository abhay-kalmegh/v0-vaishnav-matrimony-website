# Phase 1: Exact Code Changes Required
**Duration**: 30 minutes  
**Goal**: Make Android app communicate with backend  
**Status**: Ready to implement

---

## WHY EACH CHANGE IS NEEDED

### Change 1: Android Network Security
**Problem**: Android 9+ blocks cleartext (HTTP) traffic by default. Our app uses HTTP for development.  
**Solution**: Create security policy to allow HTTP only for specific IPs (development).  
**Impact**: Without this, Android app cannot reach backend API at all.

### Change 2: Update Capacitor Config
**Problem**: `cleartext: true` is a global setting that's not recommended. Need config-specific approach.  
**Solution**: Remove global cleartext flag, let network_security_config.xml handle it.  
**Impact**: Better security posture, cleaner configuration.

### Change 3: Token Storage Security
**Problem**: `localStorage` is browser storage. Android WebView may not have it or it's not secure.  
**Solution**: Use `@capacitor/preferences` for secure storage on Android.  
**Impact**: Tokens persist correctly across app restarts, stored securely on device.

### Change 4: Update Backend CORS
**Problem**: Backend only allows `localhost` and `127.0.0.1`. Android uses different origin.  
**Solution**: Add Android app URLs to CORS whitelist.  
**Impact**: Browser won't block API requests from Android app.

---

## EXACT CODE CHANGES

## CHANGE 1: Create Android Network Security Config

**File**: CREATE `android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Allow cleartext (HTTP) traffic to development IPs only -->
    <domain-config cleartextTrafficPermitted="true">
        <!-- Your development backend IP -->
        <domain includeSubdomains="true">192.168.1.7</domain>
        <!-- Android emulator default IP to reach host -->
        <domain includeSubdomains="true">10.0.2.2</domain>
        <!-- Localhost fallback -->
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
    </domain-config>
    
    <!-- Production: enforce HTTPS -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.vaishnav-vivaah.com</domain>
    </domain-config>
</network-security-config>
```

**Why**: Tells Android to allow HTTP only for development IPs, enforce HTTPS for production.

---

## CHANGE 2: Update AndroidManifest.xml

**File**: `android/app/src/main/AndroidManifest.xml`

Find this section:
```xml
<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    ...
>
```

Add this attribute:
```xml
<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:networkSecurityConfig="@xml/network_security_config"
    ...
>
```

**Why**: Links the network security config to the app.

---

## CHANGE 3: Update capacitor.config.ts

**File**: `capacitor.config.ts`

**Current Code**:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vaishnav.vivaah',
  appName: 'Vaishnav Vivaah',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    hostname: 'localhost',
    iosScheme: 'capacitor',
    cleartext: true,  // ❌ Remove this
  },
  // ... rest of config
};
```

**New Code**:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vaishnav.vivaah',
  appName: 'Vaishnav Vivaah',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    // Removed: hostname: 'localhost' (Android can't resolve localhost)
    // Removed: cleartext: true (handled by network_security_config.xml)
  },
  // ... rest of config unchanged
};

export default config;
```

**What Changed**:
- ❌ Removed `hostname: 'localhost'` (Android can't resolve this)
- ❌ Removed `cleartext: true` (now handled in network_security_config.xml)
- ✅ Kept `androidScheme: 'https'` (good for HTTPS redirect)
- ✅ Kept everything else unchanged

**Why**: Cleaner, more secure configuration. Android's WebView will use `network_security_config.xml`.

---

## CHANGE 4: Update API Client for Secure Storage

**File**: `lib/api.ts`

**Step 1**: Install Capacitor Preferences
```bash
npm install @capacitor/preferences
```

**Current Code**:
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');  // ❌ Using localStorage
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);  // ❌ Using localStorage

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');  // ❌ Using localStorage
        localStorage.removeItem('refresh_token');  // ❌ Using localStorage
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

**New Code**:
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { Preferences } from '@capacitor/preferences';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function for cross-platform token storage
const getStorageValue = async (key: string): Promise<string | null> => {
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
    const token = await getStorageValue('access_token');  // ✅ Now uses secure storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getStorageValue('refresh_token');  // ✅ Now uses secure storage
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          await setStorageValue('access_token', access);  // ✅ Now uses secure storage

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        await removeStorageValue('access_token');  // ✅ Now uses secure storage
        await removeStorageValue('refresh_token');  // ✅ Now uses secure storage
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

**What Changed**:
- ✅ Added `@capacitor/preferences` import
- ✅ Created helper functions for cross-platform storage
- ✅ Replaced all `localStorage` calls with helper functions
- ✅ Functions are async-safe for both web and mobile
- ✅ Web fallback to localStorage for dev server
- ✅ Android uses secure storage automatically

**Why**: 
- Web dev uses localStorage (fine for local dev)
- Android app uses Capacitor Preferences (secure on device)
- Same code works on both

---

## CHANGE 5: Update Auth Context

**File**: `lib/context/auth-context.tsx`

**Current Code**:
```typescript
const login = async (phone: string, otp: string) => {
  try {
    setIsLoading(true);
    const response = await authAPI.verifyOtp({ phone, otp });
    localStorage.setItem('access_token', response.access);  // ❌ Using localStorage
    localStorage.setItem('refresh_token', response.refresh);  // ❌ Using localStorage
    setUser(response.user);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

const register = async (data: any) => {
  try {
    setIsLoading(true);
    const response = await authAPI.register(data);
    localStorage.setItem('access_token', response.access);  // ❌ Using localStorage
    localStorage.setItem('refresh_token', response.refresh);  // ❌ Using localStorage
    setUser(response.user);
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

const logout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('access_token');  // ❌ Using localStorage
    localStorage.removeItem('refresh_token');  // ❌ Using localStorage
    setUser(null);
  }
};

const refreshUser = async () => {
  try {
    const response = await authAPI.getCurrentUser();
    setUser(response);
  } catch (error) {
    console.error('Refresh user error:', error);
    localStorage.removeItem('access_token');  // ❌ Using localStorage
    localStorage.removeItem('refresh_token');  // ❌ Using localStorage
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};

// Check if user is logged in on mount
useEffect(() => {
  const token = localStorage.getItem('access_token');  // ❌ Using localStorage
  if (token) {
    refreshUser();
  } else {
    setIsLoading(false);
  }
}, []);
```

**New Code**:
```typescript
import { Preferences } from '@capacitor/preferences';

// Helper functions (same as in api.ts)
const getStorageValue = async (key: string): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key });
    if (value) return value;
  } catch (e) {
    // Fallback
  }
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setStorageValue = async (key: string, value: string): Promise<void> => {
  try {
    await Preferences.set({ key, value });
  } catch (e) {
    // Fallback
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeStorageValue = async (key: string): Promise<void> => {
  try {
    await Preferences.remove({ key });
  } catch (e) {
    // Fallback
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

// Updated functions:
const login = async (phone: string, otp: string) => {
  try {
    setIsLoading(true);
    const response = await authAPI.verifyOtp({ phone, otp });
    await setStorageValue('access_token', response.access);  // ✅ Now secure
    await setStorageValue('refresh_token', response.refresh);  // ✅ Now secure
    setUser(response.user);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

const register = async (data: any) => {
  try {
    setIsLoading(true);
    const response = await authAPI.register(data);
    await setStorageValue('access_token', response.access);  // ✅ Now secure
    await setStorageValue('refresh_token', response.refresh);  // ✅ Now secure
    setUser(response.user);
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

const logout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    await removeStorageValue('access_token');  // ✅ Now secure
    await removeStorageValue('refresh_token');  // ✅ Now secure
    setUser(null);
  }
};

const refreshUser = async () => {
  try {
    const response = await authAPI.getCurrentUser();
    setUser(response);
  } catch (error) {
    console.error('Refresh user error:', error);
    await removeStorageValue('access_token');  // ✅ Now secure
    await removeStorageValue('refresh_token');  // ✅ Now secure
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};

// Check if user is logged in on mount
useEffect(() => {
  const checkAuth = async () => {
    const token = await getStorageValue('access_token');  // ✅ Now secure
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  };
  
  checkAuth();
}, []);
```

**What Changed**:
- ✅ Added Capacitor Preferences import
- ✅ Added same helper functions as api.ts
- ✅ All `localStorage` calls replaced with helpers
- ✅ useEffect is now async-safe

---

## CHANGE 6: Update Backend CORS

**File**: `backend/.env`

**Current**:
```
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://localhost,http://localhost
```

**Updated**:
```
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://localhost,http://localhost,http://192.168.1.7:3000,http://10.0.2.2:3000,http://127.0.0.1:8081,capacitor://localhost
```

**Why Each Addition**:
- `http://192.168.1.7:3000` - Android device on LAN (dev)
- `http://10.0.2.2:3000` - Android emulator host access
- `http://127.0.0.1:8081` - Alternative emulator address
- `capacitor://localhost` - Capacitor app origin

**Alternative (Better for Production)**:
```python
# In Django settings, instead of hardcoded:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost",
    "http://localhost",
    "http://192.168.1.7:3000",
    "http://10.0.2.2:3000",
    "capacitor://localhost",
]

# For production:
if not DEBUG:
    CORS_ALLOWED_ORIGINS = [
        "https://api.vaishnav-vivaah.com",
        "https://www.vaishnav-vivaah.com",
    ]
```

---

## CHANGE 7: Update .env File

**File**: `.env`

Ensure it has:
```
NEXT_PUBLIC_API_URL=http://192.168.1.7:8000/api
```

For different environments, create:

**File**: `.env.production`
```
NEXT_PUBLIC_API_URL=https://api.vaishnav-vivaah.com/api
```

**File**: `.env.mobile`
```
NEXT_PUBLIC_API_URL=http://192.168.1.7:8000/api
```

---

## VERIFICATION CHECKLIST

After making all 7 changes:

- [ ] `network_security_config.xml` created
- [ ] `AndroidManifest.xml` updated with `android:networkSecurityConfig`
- [ ] `capacitor.config.ts` updated (removed hostname and cleartext)
- [ ] `npm install @capacitor/preferences` completed
- [ ] `lib/api.ts` updated with secure storage
- [ ] `lib/context/auth-context.tsx` updated with secure storage
- [ ] `backend/.env` CORS updated
- [ ] `.env` has correct backend IP

---

## BUILD & TEST

```bash
# Install new dependency
npm install @capacitor/preferences

# Build web version
npm run build

# Sync with Capacitor
npx cap sync android

# Open Android Studio
npx cap open android

# Run Android emulator
# In Android Studio: Device Manager → Start emulator

# Test login:
# 1. App should open without errors
# 2. Can see login page
# 3. Send OTP triggers backend call
# 4. Verify OTP triggers backend call
# 5. Successful login redirects to dashboard
```

---

## TROUBLESHOOTING

### Issue: "Cannot reach API from Android"
**Check**:
1. Backend running: `python manage.py runserver 0.0.0.0:8000`
2. Firewall allows port 8000
3. Android device/emulator on same network
4. network_security_config.xml created
5. Capacitor config updated

### Issue: "CORS error on Android"
**Check**:
1. Backend CORS_ALLOWED_ORIGINS updated
2. Backend server restarted after .env change
3. Check Network tab in Chrome DevTools (remote debug)

### Issue: "Tokens not persisting"
**Check**:
1. @capacitor/preferences installed
2. api.ts and auth-context.tsx both updated
3. No errors in console
4. Restart app after code changes

### Issue: "Android says localhost unknown"
**Fix**: Already handled by removing `hostname: 'localhost'` from capacitor.config.ts

---

## NEXT STEP

After Phase 1 is complete and verified:
1. Run: `npm run build`
2. Test: `npx cap sync android && npx cap open android`
3. Verify login works on Android
4. Then proceed to Phase 2 (Register page integration)

---

**Phase 1 Complete** → Proceed to Phase 2: Core Feature Integration
