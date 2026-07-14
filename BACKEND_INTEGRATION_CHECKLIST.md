# Backend Integration Checklist
**Vaishnav Vivaah - Backend Requirements Verification**

---

## BACKEND ENDPOINTS VERIFICATION

### 1. AUTHENTICATION ENDPOINTS

#### POST `/auth/send-otp/`
```
Request: { phone: string }
Response: { message: string } or error
Purpose: Send OTP to phone number
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify SMS gateway integration (Twilio/AWS SNS)
  - [ ] Check OTP expiry (recommend 5-10 minutes)
  - [ ] Test rate limiting (prevent spam)
  - [ ] Verify phone number validation
```

#### POST `/auth/verify-otp/`
```
Request: { phone: string, otp: string }
Response: { access: string, refresh: string, user: { id, phone, email, first_name, last_name, is_verified, profile_completed } }
Purpose: Verify OTP and return JWT tokens
Status: ✅ MUST VERIFY
Todo:
  - [ ] Confirm JWT expiry times (access: 15min, refresh: 7 days)
  - [ ] Verify user auto-creation on first login
  - [ ] Check profile_completed flag initialization
  - [ ] Test invalid OTP handling
```

#### POST `/auth/register/`
```
Request: {
  phone: string,
  email: string,
  first_name: string,
  last_name: string,
  date_of_birth: string (YYYY-MM-DD),
  gender: string (M/F/Other),
  sampraday: number (ID from spirituality API)
}
Response: { access: string, refresh: string, user: {...} }
Purpose: Register new user with details
Status: ❓ VERIFY IMPLEMENTATION
Todo:
  - [ ] Verify user validation (unique email, phone)
  - [ ] Check sampraday foreign key validation
  - [ ] Ensure date_of_birth format handling
  - [ ] Verify gender field constraints
  - [ ] Test duplicate phone handling (should update existing)
```

#### POST `/auth/token/refresh/`
```
Request: { refresh: string }
Response: { access: string }
Purpose: Refresh expired access token
Status: ✅ MUST VERIFY
Todo:
  - [ ] Confirm token refresh works
  - [ ] Check refresh token rotation (optional)
  - [ ] Verify invalid refresh token handling
```

#### POST `/auth/logout/`
```
Request: {} (Bearer token in header)
Response: { message: string }
Purpose: Invalidate tokens (optional, client-side removal ok)
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify endpoint existence
  - [ ] Check if tokens are blacklisted
  - [ ] OR if client-side logout is sufficient
```

#### GET `/auth/me/`
```
Request: {} (Bearer token in header)
Response: { user: {...} }
Purpose: Get current authenticated user
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify response includes all user fields
  - [ ] Check authentication required
  - [ ] Test with invalid token
```

---

### 2. PROFILE ENDPOINTS

#### GET `/profiles/me/`
```
Request: {} (Bearer token)
Response: {
  id: number,
  user: number,
  bio: string,
  age: number,
  height: string,
  caste: string,
  city: string,
  state: string,
  occupation: string,
  income_range: string,
  photos: Array,
  is_verified: boolean,
  created_at: string,
  updated_at: string
}
Purpose: Get current user's profile
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify profile auto-creation on user registration
  - [ ] Check all fields are populated
  - [ ] Verify photos array structure
```

#### PATCH `/profiles/me/`
```
Request: {
  bio?: string,
  height?: string,
  caste?: string,
  city?: string,
  state?: string,
  occupation?: string,
  income_range?: string
}
Response: { Profile object }
Purpose: Update user profile
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify partial updates work
  - [ ] Check field validation (lengths, formats)
  - [ ] Test concurrent updates
```

#### GET `/profiles/{id}/`
```
Request: { id: number }
Response: { Profile object }
Purpose: Get specific profile (for viewing others)
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify profile visibility rules (privacy)
  - [ ] Check photo visibility
  - [ ] Test with non-existent profile
```

#### GET `/profiles/search/`
```
Request: {
  age_min?: number,
  age_max?: number,
  gender?: string,
  sampraday?: number,
  city?: string,
  limit?: number (default 10),
  offset?: number (default 0)
}
Response: { count: number, results: [Profile] }
Purpose: Search profiles with filters
Status: ✅ MUST VERIFY
Todo:
  - [ ] Test all filter combinations
  - [ ] Verify pagination works
  - [ ] Check query performance (add indexes)
  - [ ] Verify it doesn't return current user
  - [ ] Check privacy filters (e.g., verified users only)
  - [ ] Test empty results handling
```

#### POST `/profiles/{id}/upload-photo/`
```
Request: FormData { image: File }
Response: { id: number, url: string, profile: number }
Purpose: Upload profile photo
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify file size limit (recommend 5MB)
  - [ ] Check image format validation (JPG, PNG)
  - [ ] Test image compression/optimization
  - [ ] Verify storage backend (S3, local, etc.)
  - [ ] Check max photos per profile (recommend 5)
  - [ ] Verify photo order/priority
```

#### DELETE `/profiles/photos/{id}/`
```
Request: {} (Bearer token)
Response: { message: string }
Purpose: Delete specific photo
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify user owns the photo
  - [ ] Check deletion from storage
  - [ ] Prevent deleting all photos (keep 1 minimum)
```

#### POST `/profiles/complete-setup/`
```
Request: { step: string, data: object }
Response: { Profile object }
Purpose: Multi-step profile completion
Status: ❓ VERIFY IMPLEMENTATION
Todo:
  - [ ] List all valid steps (basic, photos, preferences, etc.)
  - [ ] Verify step validation
  - [ ] Check data validation per step
```

---

### 3. MATCH SUGGESTION ENDPOINTS

#### GET `/matches/suggestions/`
```
Request: { limit?: number, offset?: number }
Response: {
  count: number,
  results: [{
    id: number,
    profile: number,
    profile_data: {
      user: { first_name, last_name },
      age: number,
      city: string,
      occupation: string,
      sampraday: { name: string },
      bio: string
    },
    compatibility_score: number (0-100),
    reasoning: string,
    created_at: string
  }]
}
Purpose: Get personalized match suggestions
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify algorithm implementation
  - [ ] Check compatibility score calculation
  - [ ] Verify suggestions are refreshed daily
  - [ ] Test pagination
  - [ ] Verify doesn't suggest already interacted users
  - [ ] Check gender preference matching
```

#### GET `/matches/{id}/`
```
Request: { id: number }
Response: { MatchSuggestion object }
Purpose: Get specific match details
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify match exists and is valid
  - [ ] Check permission to view
```

#### POST `/matches/{id}/accept/`
```
Request: {} (Bearer token)
Response: { message: string }
Purpose: Accept a match suggestion (creates interest)
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify creates interest record
  - [ ] Check notification sent to other user
  - [ ] Prevent double-acceptance
```

#### POST `/matches/{id}/reject/`
```
Request: {} (Bearer token)
Response: { message: string }
Purpose: Reject a match suggestion
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify doesn't suggest this user again (or after delay)
  - [ ] Check notification handling
```

#### GET `/matches/compatibility/{id}/`
```
Request: { id: number }
Response: { compatibility_details: object }
Purpose: Get detailed compatibility breakdown
Status: ❓ VERIFY IMPLEMENTATION
Todo:
  - [ ] Verify endpoint exists
  - [ ] Check detail fields (age match, caste, city, etc.)
```

---

### 4. INTEREST ENDPOINTS

#### POST `/interests/send/`
```
Request: { to_user: number }
Response: { Interest object }
Purpose: Send interest to another user
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify can't send to self
  - [ ] Prevent duplicate interests (or allow)
  - [ ] Create conversation if both interested
  - [ ] Send notification to receiver
```

#### POST `/interests/{id}/respond/`
```
Request: { status: 'accepted' | 'rejected' }
Response: { Interest object }
Purpose: Respond to received interest
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify interest exists and is for current user
  - [ ] Check status update
  - [ ] Create conversation if accepted
  - [ ] Send notification to sender
```

#### GET `/interests/received/`
```
Request: { status?: 'pending' | 'accepted' | 'rejected' }
Response: [Interest]
Purpose: Get received interests with filters
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify filtering by status
  - [ ] Check pagination
  - [ ] Verify doesn't include sent interests
```

#### GET `/interests/sent/`
```
Request: { status?: string }
Response: [Interest]
Purpose: Get sent interests
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify filtering
  - [ ] Check pagination
```

#### POST `/shortlist/add/`
```
Request: { profile: number }
Response: { Shortlist object }
Purpose: Add profile to shortlist
Status: ✅ MUST VERIFY
Todo:
  - [ ] Prevent duplicate entries
  - [ ] Verify profile exists
```

#### DELETE `/shortlist/{id}/`
```
Request: {} (Bearer token)
Response: { message: string }
Purpose: Remove from shortlist
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify ownership
  - [ ] Check deletion
```

#### GET `/shortlist/`
```
Request: {}
Response: [Shortlist]
Purpose: Get user's shortlist
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify pagination
  - [ ] Check sorting
```

---

### 5. MESSAGING ENDPOINTS

#### GET `/messaging/conversations/`
```
Request: {}
Response: [{
  id: number,
  participants: [number],
  other_user: {
    id: number,
    first_name: string,
    last_name: string,
    profile: { photos: Array }
  },
  last_message: string,
  last_message_time: string,
  unread_count: number
}]
Purpose: Get all conversations for user
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify returns only user's conversations
  - [ ] Check sorting (recent first)
  - [ ] Test unread count accuracy
  - [ ] Check pagination
```

#### GET `/messaging/conversations/{id}/`
```
Request: { id: number }
Response: {
  id: number,
  messages: [{
    id: number,
    conversation: number,
    sender: number,
    content: string,
    is_read: boolean,
    created_at: string
  }],
  other_user: { id, first_name, last_name, profile }
}
Purpose: Get conversation with messages
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify access permission
  - [ ] Check message ordering (chronological)
  - [ ] Test pagination for many messages
  - [ ] Mark messages as read
```

#### POST `/messaging/messages/`
```
Request: { conversation: number, content: string }
Response: { Message object }
Purpose: Send message in conversation
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify conversation exists and user is participant
  - [ ] Check content validation (non-empty, max length)
  - [ ] Send push notification to other user
  - [ ] Update last_message in conversation
```

#### POST `/messaging/conversations/{id}/mark-read/`
```
Request: {} (Bearer token)
Response: { message: string }
Purpose: Mark conversation messages as read
Status: ✅ MUST VERIFY
Todo:
  - [ ] Update unread_count
  - [ ] Verify ownership
```

#### POST `/messaging/conversations/start/`
```
Request: { user: number }
Response: { Conversation object }
Purpose: Start new conversation with user
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify user exists
  - [ ] Return existing conversation if already started
  - [ ] Verify mutual interest (both accepted)
```

#### DELETE `/messaging/conversations/{id}/`
```
Request: {} (Bearer token)
Response: { message: string }
Purpose: Delete/archive conversation
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify ownership
  - [ ] Check soft delete vs hard delete
```

---

### 6. EVENTS ENDPOINTS

#### GET `/events/upcoming/`
```
Request: {}
Response: [{
  id: number,
  title: string,
  description: string,
  date: string,
  location: string,
  event_type: string,
  capacity: number,
  registered_count: number,
  is_registered: boolean,
  created_at: string
}]
Purpose: Get upcoming events
Status: ✅ MUST VERIFY
Todo:
  - [ ] Filter past events
  - [ ] Check pagination
  - [ ] Verify is_registered flag
  - [ ] Sort by date
```

#### GET `/events/{id}/`
```
Request: { id: number }
Response: { Event object }
Purpose: Get event details
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify event exists
```

#### POST `/events/register/`
```
Request: { event: number }
Response: { EventRegistration object }
Purpose: Register for event
Status: ✅ MUST VERIFY
Todo:
  - [ ] Check capacity
  - [ ] Prevent duplicate registration
  - [ ] Send confirmation notification
```

#### POST `/events/{id}/unregister/`
```
Request: {} (Bearer token)
Response: { message: string }
Purpose: Unregister from event
Status: ✅ MUST VERIFY
Todo:
  - [ ] Verify registration exists
  - [ ] Update registered_count
```

#### GET `/events/my-registrations/`
```
Request: {}
Response: [EventRegistration]
Purpose: Get user's event registrations
Status: ✅ MUST VERIFY
Todo:
  - [ ] Check filtering (upcoming/past)
  - [ ] Verify pagination
```

---

### 7. NOTIFICATIONS ENDPOINTS

**Status**: ❓ NOT VERIFIED - VERIFY ENDPOINTS EXIST

```
Likely needed:
- GET /notifications/ - List notifications
- POST /notifications/{id}/mark-read/ - Mark read
- DELETE /notifications/{id}/ - Delete
- WebSocket: /ws/notifications/ - Real-time updates

Todo:
  - [ ] Verify notification types (interest, message, event, etc.)
  - [ ] Check push notification integration
  - [ ] Verify real-time updates (WebSocket or polling)
```

---

### 8. SPIRITUALITY ENDPOINTS (Sampraday)

**Purpose**: Get list of sampraday/caste options

```
Likely:
- GET /spirituality/sampradays/ - List all

Todo:
  - [ ] Verify endpoint
  - [ ] Check response format
  - [ ] Verify it's used in registration
```

---

### 9. SUCCESS STORIES

**Status**: ❓ NOT VERIFIED

```
Likely needed:
- GET /stories/ - List success stories
- GET /stories/{id}/ - Story detail
- POST /stories/ - Submit story (admin only)

Todo:
  - [ ] Verify endpoints exist
  - [ ] Check if hardcoded or database-backed
```

---

### 10. HEALTH CHECK / STATUS

**Recommended** (not critical):
```
GET /health/
Response: { status: 'ok', timestamp: string }

Todo:
  - [ ] Add health check endpoint for monitoring
```

---

## BACKEND CONFIGURATION CHECKLIST

### Database

- [ ] PostgreSQL running and accessible
- [ ] Migrations applied (`python manage.py migrate`)
- [ ] Superuser created (`python manage.py createsuperuser`)
- [ ] Sampraday data seeded (`python manage.py seed_sampradays`)
- [ ] Test data created for development

### Authentication & Security

- [ ] JWT tokens configured correctly
- [ ] Secret key is strong (production)
- [ ] CORS origins include:
  - [ ] `http://localhost:3000` (web dev)
  - [ ] `http://127.0.0.1:3000` (web dev)
  - [ ] `http://192.168.1.7:3000` (Android dev on LAN)
  - [ ] `https://api.vaishnav-vivaah.com` (production)
- [ ] CSRF tokens handled correctly
- [ ] Rate limiting configured
- [ ] Email validation working

### File Upload

- [ ] Storage backend configured (S3 or local)
- [ ] File size limits set
- [ ] Image optimization working
- [ ] CORS headers for uploaded files

### SMS Gateway

- [ ] OTP provider configured (Twilio/AWS SNS)
- [ ] SMS_API_KEY in .env
- [ ] SMS_SENDER_ID configured
- [ ] OTP expiry set (5-10 minutes)
- [ ] Rate limiting on OTP sends

### Celery/Background Tasks (Optional)

- [ ] Redis running
- [ ] Celery configured
- [ ] Background tasks for emails/notifications
- [ ] Periodic tasks (cleanup, matches generation)

### Email Configuration

- [ ] Email backend configured
- [ ] SMTP credentials in .env
- [ ] Welcome emails sent on registration
- [ ] Interest notifications emailed

### Logging & Monitoring

- [ ] Logging configured
- [ ] Error tracking (Sentry optional)
- [ ] Database query logging
- [ ] API request logging

---

## BEFORE ANDROID TESTING

### Critical Pre-flight Checks

- [ ] Database migrations applied and successful
- [ ] Backend running on development machine (`python manage.py runserver 0.0.0.0:8000`)
- [ ] Frontend `.env` has correct backend IP (`NEXT_PUBLIC_API_URL`)
- [ ] Firewall allows connections to port 8000
- [ ] Android device/emulator can reach backend IP
- [ ] CORS origins include Android app origin
- [ ] Basic manual API testing in Postman succeeds
- [ ] Login/OTP flow works in browser
- [ ] Profile endpoints return data
- [ ] Search returns results

---

## MISSING FEATURES (BACKEND PERSPECTIVE)

| Feature | Status | Backend Required |
|---------|--------|------------------|
| Profile Photos | Partially | Upload works but may need optimization |
| Matching Algorithm | Needed | Compatibility scoring may need tuning |
| Real-time Notifications | Needed | WebSocket support for instant messages |
| User Verification | Needed | Phone/email verification badges |
| Success Stories | Unknown | API may not exist, check |
| Admin Dashboard | Unknown | Django admin likely available |
| Analytics | Needed | Track user activity, matches, etc. |
| Reporting/Blocking | Unknown | User report/block functionality |

---

## SECURITY REVIEW - BACKEND

### What Needs to Be Verified

- [ ] SQL injection protection (Django ORM used, should be safe)
- [ ] XSS protection (user-generated content sanitized?)
- [ ] CSRF protection (tokens used?)
- [ ] Authentication bypass (no hardcoded credentials?)
- [ ] Authorization bypass (users can't access others' data?)
- [ ] File upload vulnerabilities (extensions validated? Size checked?)
- [ ] Rate limiting (to prevent brute force OTP attacks)
- [ ] Password/token expiry (tokens refreshed regularly?)
- [ ] API versioning (/api/v1/ format recommended)

---

## PRODUCTION CHECKLIST

When ready to deploy to production:

- [ ] DEBUG = False in settings
- [ ] SECRET_KEY is strong and unique
- [ ] ALLOWED_HOSTS includes production domain
- [ ] CORS_ALLOWED_ORIGINS updated for production
- [ ] Database backup configured
- [ ] SSL/TLS certificate installed (HTTPS)
- [ ] Email service configured for production
- [ ] SMS gateway configured (if using 3rd party)
- [ ] Error logging configured (Sentry, etc.)
- [ ] Database indexes optimized
- [ ] CDN configured for media files
- [ ] Monitoring and alerts set up
- [ ] Load balancer configured (if needed)
- [ ] Database replication/backup
- [ ] Application auto-scaling configured

---

## TESTING ENDPOINTS WITH POSTMAN

### 1. Authentication Flow

```
POST http://192.168.1.7:8000/api/auth/send-otp/
Content-Type: application/json

{
  "phone": "9876543210"
}

---

POST http://192.168.1.7:8000/api/auth/verify-otp/
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456"
}

Response:
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": { ... }
}

[Store access token for next requests]
```

### 2. Get Current User

```
GET http://192.168.1.7:8000/api/auth/me/
Authorization: Bearer <access_token>
```

### 3. Get Profile

```
GET http://192.168.1.7:8000/api/profiles/me/
Authorization: Bearer <access_token>
```

### 4. Update Profile

```
PATCH http://192.168.1.7:8000/api/profiles/me/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "bio": "Software engineer from Mumbai",
  "city": "Mumbai",
  "height": "5'10\"",
  "occupation": "Software Engineer"
}
```

### 5. Search Profiles

```
GET http://192.168.1.7:8000/api/profiles/search/?age_min=24&age_max=32&gender=F&city=Mumbai
Authorization: Bearer <access_token>
```

### 6. Get Match Suggestions

```
GET http://192.168.1.7:8000/api/matches/suggestions/?limit=10&offset=0
Authorization: Bearer <access_token>
```

### 7. Upload Photo

```
POST http://192.168.1.7:8000/api/profiles/1/upload-photo/
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

[Select image file]
```

---

## FINAL CHECKLIST

Before declaring backend ready for Android testing:

- [ ] All endpoints documented (Swagger/OpenAPI)
- [ ] All endpoints tested with Postman
- [ ] Database migrations applied
- [ ] Seed data populated
- [ ] Authentication flow tested end-to-end
- [ ] Profile operations tested
- [ ] Search functionality tested
- [ ] Match suggestions working
- [ ] Image upload working
- [ ] Conversations/Messaging working
- [ ] Events operations working
- [ ] Error responses consistent and helpful
- [ ] Performance acceptable (response times < 1s)
- [ ] CORS configured correctly
- [ ] Rate limiting tested
- [ ] Token refresh tested
- [ ] Invalid token handling tested
- [ ] Documentation complete

---

**Status**: This checklist must be completed before Phase 1 testing

**Next Step**: Run through this checklist, test each endpoint with Postman, then proceed with Android testing
