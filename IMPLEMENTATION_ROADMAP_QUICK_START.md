# Implementation Roadmap - Quick Start Guide

**Status**: Ready for immediate action  
**Priority**: Fix Android connectivity, then integrate features  
**Total Time**: 9-12 hours for full integration

---

## SUMMARY OF FINDINGS

### What's Working ✅
- API client setup (Axios with interceptors)
- Authentication flow (OTP login)
- Backend API definitions
- Database structure
- Capacitor Android configuration

### What's Broken ❌
- **NO frontend pages connect to backend** (all showing mock data)
- Android cleartext traffic security issue
- Environment configuration not mobile-friendly
- Error handling incomplete

### What Needs Fixing 🔧
1. Android network security
2. Feature integration (register, profile, search, etc.)
3. Real-time features (messaging, notifications)
4. Error handling and loading states

---

## PHASE 1: ANDROID SETUP & AUTHENTICATION (30 minutes)

### What to Do
1. **Create Android Network Security Config**
   - File: `android/app/src/main/res/xml/network_security_config.xml`
   - Purpose: Allow cleartext traffic for development

2. **Update capacitor.config.ts**
   - Remove `cleartext: true` global setting
   - Set proper hostname for Android

3. **Add Secure Storage Plugin**
   - Replace localStorage with @capacitor/preferences
   - Store tokens securely on Android

4. **Update Backend CORS**
   - Add Android app URLs
   - Test connectivity

### Success Criteria
- [ ] Android emulator can reach backend API
- [ ] Login works on Android
- [ ] Tokens stored securely

---

## PHASE 2: CORE FEATURE INTEGRATION (3-4 hours)

### Register Page Integration (1 hour)
**Frontend**: `app/register/page.tsx`
**Backend**: POST `/auth/register/`

```typescript
// What to implement
1. Connect form to authAPI.register()
2. Add loading state during submit
3. Show error messages on failure
4. Redirect to login on success
5. Validate all required fields
```

### Profile Edit Page (1 hour)
**Frontend**: `app/(dashboard)/profile/edit/page.tsx`
**Backend**: 
- GET `/profiles/me/`
- PATCH `/profiles/me/`
- POST `/profiles/{id}/upload-photo/`

```typescript
// What to implement
1. Fetch current profile on load
2. Populate form with profile data
3. Handle photo uploads
4. Save profile changes
5. Show success/error messages
```

### Search Profiles (1 hour)
**Frontend**: `app/(dashboard)/search/page.tsx`
**Backend**: GET `/profiles/search/`

```typescript
// What to implement
1. Connect search filters to API
2. Fetch results based on filters
3. Implement pagination
4. Show loading and error states
5. Display profile cards
```

### Success Criteria
- [ ] Users can complete registration
- [ ] Users can view and edit profiles
- [ ] Users can search for profiles
- [ ] All pages show real data from backend

---

## PHASE 3: MATCHING & INTERACTIONS (2-3 hours)

### Match Suggestions (45 minutes)
**Frontend**: `app/(dashboard)/suggestions/page.tsx`
**Backend**: 
- GET `/matches/suggestions/`
- POST `/matches/{id}/accept/`
- POST `/matches/{id}/reject/`

### Interests Management (45 minutes)
**Frontend**: `app/(dashboard)/interests/page.tsx`
**Backend**:
- POST `/interests/send/`
- GET `/interests/received/`
- POST `/interests/{id}/respond/`

### Shortlist (30 minutes)
**Frontend**: Add shortlist buttons to profiles
**Backend**:
- POST `/shortlist/add/`
- DELETE `/shortlist/{id}/`

### Success Criteria
- [ ] Users can accept/reject matches
- [ ] Users can send and respond to interests
- [ ] Users can manage shortlists
- [ ] Real-time interaction updates

---

## PHASE 4: COMMUNICATION & EVENTS (2-3 hours)

### Messaging System (1.5 hours)
**Frontend**: `app/(dashboard)/messages/page.tsx`
**Backend**: `/messaging/*` endpoints

### Events (1 hour)
**Frontend**: `app/(dashboard)/events/page.tsx`
**Backend**: `/events/*` endpoints

### Notifications (30 minutes)
**Frontend**: Add notification UI
**Backend**: `/notifications/*` endpoints

---

## PHASE 5: POLISH & OPTIMIZATION (1-2 hours)

- Error handling interceptor
- Loading spinners
- Retry logic for failed requests
- Offline support (optional)

---

## CRITICAL FIXES FIRST

### Fix #1: Capacitor Android Configuration

**File**: `capacitor.config.ts`

Change from:
```typescript
server: {
  androidScheme: 'https',
  hostname: 'localhost',
  iosScheme: 'capacitor',
  cleartext: true,
},
```

To:
```typescript
server: {
  androidScheme: 'https',
  // Remove hostname - let Capacitor handle it
  iosScheme: 'capacitor',
  // Remove cleartext - handle in network_security_config.xml
},
```

**Create**: `android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.1.7</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.vaishnav-vivaah.com</domain>
    </domain-config>
</network-security-config>
```

### Fix #2: Environment Configuration

**Create**: `.env.mobile`
```
NEXT_PUBLIC_API_URL=http://192.168.1.7:8000/api
```

**Create**: `.env.production`
```
NEXT_PUBLIC_API_URL=https://api.vaishnav-vivaah.com/api
```

### Fix #3: Token Storage Security

Install Capacitor Preferences:
```bash
npm install @capacitor/preferences
```

Update `lib/api.ts`:
```typescript
import { Preferences } from '@capacitor/preferences';

// Store token
await Preferences.set({
  key: 'access_token',
  value: token,
});

// Retrieve token
const { value } = await Preferences.get({ key: 'access_token' });
```

---

## TESTING SEQUENCE

### Step 1: Manual API Testing with Postman
```bash
# Test login
POST http://192.168.1.7:8000/api/auth/send-otp/
{"phone":"9876543210"}

# Verify OTP (use test OTP from backend)
POST http://192.168.1.7:8000/api/auth/verify-otp/
{"phone":"9876543210","otp":"000000"}

# Get profile
GET http://192.168.1.7:8000/api/profiles/me/
Header: Authorization: Bearer <token>
```

### Step 2: Web Testing
```bash
npm run dev
# Test all features in browser first
# Easier to debug, faster iteration
```

### Step 3: Android Emulator Testing
```bash
npm run build
npx cap sync android
npx cap open android
# Run emulator
# Test features on Android
```

### Step 4: Real Device Testing
- Connect to same WiFi as backend
- Verify all features work
- Check performance

---

## COMMON ISSUES & FIXES

| Issue | Cause | Fix |
|-------|-------|-----|
| Android can't reach backend | Hostname resolution failed | Use IP instead of localhost, check firewall |
| CORS error on Android | CORS origins not configured | Add Android origin to backend CORS |
| Tokens not persisting | localStorage not available | Use Capacitor Preferences |
| Photos not uploading | FormData not handled | Check backend multipart handler |
| Messages not real-time | No WebSocket configured | Implement polling or WebSocket |

---

## FILE CHANGES NEEDED

### Frontend Files to Modify

```
lib/
  ├── api/
  │   ├── auth.ts (✅ ready)
  │   ├── profiles.ts (✅ ready)
  │   ├── matches.ts (✅ ready)
  │   ├── interests.ts (✅ ready)
  │   ├── messaging.ts (✅ ready)
  │   ├── events.ts (✅ ready)
  │   └── notifications.ts (❌ create new)
  ├── api.ts (✅ update for secure storage)
  ├── context/
  │   └── auth-context.tsx (✅ ready)
  └── hooks/
      ├── useAuth.ts (✅ already exists)
      ├── useFetch.ts (❌ create new)
      ├── useForm.ts (❌ create new)
      └── useInfiniteQuery.ts (❌ create new)

app/
  ├── login/page.tsx (✅ ready)
  ├── register/page.tsx (❌ connect API)
  └── (dashboard)/
      ├── profile/
      │   ├── edit/page.tsx (❌ connect API)
      │   └── view/page.tsx (❌ connect API)
      ├── search/page.tsx (❌ connect API)
      ├── suggestions/page.tsx (❌ real data)
      ├── interests/page.tsx (❌ real data)
      ├── messages/page.tsx (❌ real data)
      └── events/page.tsx (❌ real data)

components/
  ├── LoadingSpinner.tsx (❌ create)
  ├── ErrorAlert.tsx (❌ create)
  └── [existing components updated with API calls]

capacitor.config.ts (✅ update)
```

### Backend Files to Verify

```
apps/
  ├── accounts/
  │   └── views.py (verify all endpoints)
  ├── profiles/
  │   └── views.py (verify all endpoints)
  ├── matches/
  │   └── views.py (verify algorithm)
  ├── interests/
  │   └── views.py (verify endpoints)
  ├── messaging/
  │   └── views.py (verify endpoints)
  ├── events/
  │   └── views.py (verify endpoints)
  ├── notifications/
  │   └── views.py (create if missing)
  └── spirituality/
      └── views.py (sampraday endpoints)

.env (update CORS_ALLOWED_ORIGINS)
```

### Android Files to Create/Modify

```
android/
  └── app/src/main/res/xml/
      └── network_security_config.xml (❌ create)

capacitor.config.ts (modify)
```

---

## COMMAND REFERENCE

### Development

```bash
# Start web dev server
npm run dev

# Build for Android
npm run build

# Sync with Capacitor
npx cap sync android

# Open Android project in Android Studio
npx cap open android

# Test on Android emulator
# (Open Android Studio and run emulator)
```

### Testing

```bash
# Test in browser
curl -X POST http://localhost:8000/api/auth/send-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'

# Test from Android
# Use Postman on Android device OR
# Check browser dev tools for network requests
```

---

## SUCCESS METRICS

- [ ] Android app launches without errors
- [ ] Can login with OTP
- [ ] Can register new account
- [ ] Can view and edit profile
- [ ] Can search for profiles
- [ ] Can accept/reject matches
- [ ] Can send interests
- [ ] Can message other users
- [ ] Can register for events
- [ ] All API calls show real data from backend
- [ ] Error messages display correctly
- [ ] Loading states show during API calls
- [ ] No console errors
- [ ] No network errors in DevTools

---

## ESTIMATED TIMELINE

| Phase | Task | Time | Cumulative |
|-------|------|------|-----------|
| 1 | Android Setup | 30 min | 30 min |
| 2 | Register | 1 hr | 1.5 hr |
| 2 | Profile Edit | 1 hr | 2.5 hr |
| 2 | Search | 1 hr | 3.5 hr |
| 3 | Suggestions | 45 min | 4.25 hr |
| 3 | Interests | 45 min | 5 hr |
| 3 | Shortlist | 30 min | 5.5 hr |
| 4 | Messaging | 1.5 hr | 7 hr |
| 4 | Events | 1 hr | 8 hr |
| 4 | Notifications | 30 min | 8.5 hr |
| 5 | Polish | 1-1.5 hr | 9.5-10 hr |

**Total**: 9-12 hours for full integration

---

## NEXT IMMEDIATE ACTION

1. Run Phase 1 Android Setup (30 minutes)
2. Test login on Android emulator
3. Proceed to Phase 2 if successful

**Ready to start?**
