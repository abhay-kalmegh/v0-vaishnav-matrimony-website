# Vaishnav Vivaah - Frontend-Backend API Integration

## Overview

The Vaishnav Vivaah matrimony platform is built with a **Next.js 16 frontend** (React) connecting to a **Django REST backend** via RESTful APIs.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Next.js Frontend                             │
│                      (http://localhost:3000)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Components:                 API Clients:                            │
│  ✓ Login (OTP)          →    auth.ts      →  POST /auth/verify-otp/ │
│  ✓ Dashboard            →    matches.ts   →  GET  /matches/          │
│  ✓ Search               →    profiles.ts  →  GET  /profiles/search/  │
│  ✓ Interests            →    interests.ts →  POST /interests/send/    │
│  ✓ Messaging            →    messaging.ts →  POST /messages/         │
│  ✓ Protected Routes     →    api.ts       →  Bearer Token Auth      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓ HTTPS/JSON
┌─────────────────────────────────────────────────────────────────────┐
│                      Django REST Backend                             │
│                    (http://localhost:8000)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  11 Django Apps:                                                      │
│  ✓ Accounts (Users, OTP, JWT)                                        │
│  ✓ Profiles (Profile data, photos, search)                           │
│  ✓ Spirituality (Sampraday, Gurus, practices)                        │
│  ✓ Matches (Suggestions, compatibility scoring)                      │
│  ✓ Interests (Send/receive/respond)                                  │
│  ✓ Messaging (Conversations, messages)                               │
│  ✓ Events (Event management, registration)                           │
│  ✓ Subscriptions (Plans, payments)                                   │
│  ✓ Verification (Document verification)                              │
│  ✓ Notifications (In-app notifications)                              │
│  ✓ Success Stories (Couple stories)                                  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓ ORM
                         PostgreSQL Database
```

## Architecture

### Frontend (Next.js + React)

**Structure:**
```
app/
├── (dashboard)/          # Protected routes
│   ├── layout.tsx       # Dashboard layout with sidebar
│   ├── dashboard/       # Home dashboard
│   ├── search/          # Profile search
│   ├── profile/[id]/    # View profile
│   ├── interests/       # Interest management
│   ├── messages/        # Messaging
│   ├── settings/        # User settings
│   ├── suggestions/     # Match suggestions
│   └── events/          # Events
├── login/               # Login with OTP
├── register/            # 6-step registration
├── about/               # About page
├── contact/             # Contact page
└── layout.tsx           # Root layout with AuthProvider

lib/
├── api.ts               # Axios client with JWT interceptors
├── api/
│   ├── auth.ts          # Auth endpoints
│   ├── profiles.ts      # Profile endpoints
│   ├── matches.ts       # Match endpoints
│   ├── interests.ts     # Interest endpoints
│   ├── messaging.ts     # Messaging endpoints
│   └── events.ts        # Event endpoints
├── context/
│   └── auth-context.tsx # Auth state & user management
└── components/
    ├── protected-route.tsx    # Route guards
    └── dashboard/             # Dashboard components

components/
├── landing/             # Landing page sections
├── dashboard/           # Dashboard feature components
└── ui/                  # shadcn/ui components
```

### Backend (Django)

**Structure:**
```
backend/
├── config/
│   ├── settings.py      # Django settings (JWT, CORS, DB)
│   ├── urls.py          # Root URL router
│   ├── wsgi.py          # Production WSGI
│   └── celery.py        # Async tasks
│
├── apps/
│   ├── accounts/        # User auth (OTP, JWT tokens)
│   ├── profiles/        # User profiles & search
│   ├── spirituality/    # Sampraday & spirituality
│   ├── matches/         # Match suggestions & engine
│   ├── interests/       # Interest management
│   ├── messaging/       # Conversations & messages
│   ├── events/          # Events
│   ├── subscriptions/   # Subscription plans
│   ├── verification/    # Profile verification
│   ├── notifications/   # In-app notifications
│   └── success_stories/ # Success stories
│
└── manage.py            # Django CLI
```

## Authentication Flow

### 1. OTP-Based Login

```
User enters phone → Frontend calls /auth/send-otp/
                  → Backend generates 6-digit OTP
                  → OTP sent to user (mock in dev)
                  ↓
User enters OTP → Frontend calls /auth/verify-otp/
                → Backend validates OTP
                → Returns access & refresh tokens
                → Frontend stores tokens in localStorage
                ↓
Frontend sets Authorization header → Bearer {access_token}
                ↓
All subsequent requests authenticated
```

### 2. Token Management

```python
# Request interceptor adds token
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

# On 401 response, automatically refresh
POST /auth/token/refresh/ with refresh_token
← Returns new access_token
→ Retry original request

# On refresh failure, redirect to login
localStorage.removeItem('access_token')
localStorage.removeItem('refresh_token')
router.push('/login')
```

## API Integration Examples

### Example 1: Login with OTP

**Frontend (`app/login/page.tsx`):**
```typescript
import { useAuth } from '@/lib/context/auth-context';

export default function LoginPage() {
  const { sendOtp, login } = useAuth();
  
  const handleSendOtp = async () => {
    await sendOtp(phone);  // Calls POST /auth/send-otp/
  };
  
  const handleVerifyOtp = async () => {
    await login(phone, otp);  // Calls POST /auth/verify-otp/
    router.push('/dashboard');
  };
}
```

**Backend (`apps/accounts/views.py`):**
```python
class SendOTPView(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        otp = generate_otp()  # Generate random 6-digit
        # Save OTP to cache with expiry
        cache.set(f'otp_{phone}', otp, 600)  # 10 minutes
        # Send OTP via SMS (mock in dev)
        return Response({'message': 'OTP sent'})

class VerifyOTPView(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')
        
        # Validate OTP
        cached_otp = cache.get(f'otp_{phone}')
        if cached_otp != otp:
            raise ValidationError('Invalid OTP')
        
        # Get or create user
        user, _ = User.objects.get_or_create(phone=phone)
        
        # Generate JWT tokens
        access_token = create_access_token(user)
        refresh_token = create_refresh_token(user)
        
        return Response({
            'access': access_token,
            'refresh': refresh_token,
            'user': UserSerializer(user).data
        })
```

### Example 2: Search Profiles with Filters

**Frontend (`components/dashboard/search-content.tsx`):**
```typescript
const fetchProfiles = async () => {
  const filters = {
    age_min: 20,
    age_max: 35,
    sampraday: 1,  // ISKCON
    city: 'Mumbai'
  };
  
  const response = await profilesAPI.searchProfiles(filters);
  // Returns: { count: 42, results: [...profiles] }
  setProfiles(response.results);
};
```

**Backend API (`/profiles/search/`):**
```
GET /api/profiles/search/?age_min=20&age_max=35&sampraday=1&city=Mumbai

Returns:
{
  "count": 42,
  "results": [
    {
      "id": 5,
      "user": 10,
      "bio": "...",
      "age": 26,
      "city": "Mumbai",
      "photos": [...],
      ...
    },
    ...
  ]
}
```

### Example 3: Send Interest & Get Response

**Frontend (`components/dashboard/search-content.tsx`):**
```typescript
const handleSendInterest = async (userId: number) => {
  await interestsAPI.sendInterest(userId);
  // Calls POST /interests/send/ with {to_user: userId}
  alert('Interest sent!');
};
```

**Backend (`/interests/send/`):**
```python
class SendInterestView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        to_user_id = request.data.get('to_user')
        
        # Create interest
        interest = Interest.objects.create(
            from_user=request.user,
            to_user_id=to_user_id,
            status='pending'
        )
        
        # Create notification for recipient
        Notification.objects.create(
            user_id=to_user_id,
            type='interest_received',
            content=f'{request.user.first_name} sent you an interest'
        )
        
        return Response(InterestSerializer(interest).data)
```

## CORS Configuration

**Backend (`config/settings.py`):**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://yourdomain.com",  # Production
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Database
DATABASE_URL=sqlite:///db.sqlite3

# Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-password

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_EXPIRATION_DELTA=3600  # 1 hour

# Redis (for OTP cache, optional)
REDIS_URL=redis://localhost:6379/0

# Celery (for async tasks)
CELERY_BROKER_URL=redis://localhost:6379/0
```

## Error Handling

### Frontend Error Handling

```typescript
try {
  const data = await matchesAPI.getSuggestions();
  setMatches(data.results);
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired, user will be redirected
    console.error('Unauthorized');
  } else if (error.response?.status === 400) {
    // Validation error
    setError(error.response.data.detail);
  } else {
    // Network error
    setError('Failed to load matches');
  }
}
```

### Backend Error Responses

```python
# 400 Bad Request
{"detail": "Age must be between 18 and 80"}

# 401 Unauthorized
{"detail": "Authentication credentials were not provided."}

# 403 Forbidden
{"detail": "You do not have permission to perform this action."}

# 404 Not Found
{"detail": "Not found."}

# 500 Internal Server Error
{"detail": "An error occurred. Please try again later."}
```

## Performance Optimizations

### Frontend
- Lazy load images with Next.js Image component
- Use React.memo for expensive components
- Implement pagination for lists
- Cache API responses with React Query (optional upgrade)

### Backend
- Database indexes on frequently queried fields
- Pagination for large result sets (default 20 per page)
- Redis caching for OTP, sessions
- Celery for async tasks (matching, notifications)

## Security Best Practices

### Frontend
- JWT tokens stored in localStorage (consider httpOnly cookies)
- CSRF protection headers sent with requests
- XSS prevention with React's built-in sanitization
- Input validation before sending to backend

### Backend
- Password hashing with Django's default PBKDF2
- Rate limiting on OTP endpoint (max 5 attempts per minute)
- SQL injection prevention with ORM parameterization
- HTTPS in production (SECURE_SSL_REDIRECT)
- Content Security Policy headers

## Testing the Integration

### Test Scenario 1: Complete Login Flow
1. Frontend: Go to `http://localhost:3000/login`
2. Enter phone: `9876543210`
3. Click "Send OTP"
4. Enter OTP: `123456` (any 6 digits)
5. Click "Verify & Login"
6. You should be redirected to `/dashboard` with real data

### Test Scenario 2: Search Profiles
1. Go to `/dashboard/search`
2. Set age filter: 20-35
3. Click "Apply Filters"
4. See real profiles from database
5. Click "Interest" to send interest
6. Check `/dashboard/interests` to see sent interest

### Test Scenario 3: Messaging
1. Go to `/dashboard/messages`
2. See conversations from backend
3. Click a conversation to view messages
4. Type and send a message
5. See message appear in real-time

## Deployment

### Frontend (Vercel)
```bash
git push  # Auto-deploys
# Set NEXT_PUBLIC_API_URL to production backend URL
```

### Backend (Railway/Render/Heroku)
```bash
git push heroku main
heroku run python manage.py migrate
heroku run python manage.py seed_sampradays
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error | Check CORS_ALLOWED_ORIGINS in backend settings |
| 401 on every request | Check token refresh logic in api.ts |
| OTP not sending | OTP is printed to console in development |
| Empty match suggestions | Ensure user profiles exist in database |
| Slow queries | Add database indexes on search fields |

## Documentation

- **API Docs**: `http://localhost:8000/api/docs/` (Swagger)
- **Integration Guide**: See `INTEGRATION_GUIDE.md`
- **Backend README**: See `backend/README.md`
- **Frontend README**: See `frontend/README.md`
