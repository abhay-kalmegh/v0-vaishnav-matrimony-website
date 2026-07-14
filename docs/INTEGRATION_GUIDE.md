# Frontend-Backend Integration Guide

## Setup Instructions

### 1. Backend Setup (Django)

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_sampradays
python manage.py seed_plans
python manage.py createsuperuser
python manage.py runserver
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup (Next.js)

```bash
cd ..
npm install
# or
yarn install
# or
pnpm install
```

The `.env.local` file is already configured to point to `http://localhost:8000/api`

### 3. Start Frontend

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The frontend will run on `http://localhost:3000`

## Backend API Endpoints

### Authentication
- `POST /api/auth/send-otp/` - Send OTP to phone number
- `POST /api/auth/verify-otp/` - Verify OTP and login
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/token/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user info

### Profiles
- `GET /api/profiles/me/` - Get my profile
- `PATCH /api/profiles/me/` - Update my profile
- `GET /api/profiles/<id>/` - Get profile by ID
- `GET /api/profiles/search/` - Search profiles with filters
- `POST /api/profiles/<id>/upload-photo/` - Upload profile photo

### Matches
- `GET /api/matches/suggestions/` - Get match suggestions
- `GET /api/matches/<id>/` - Get match detail
- `POST /api/matches/<id>/accept/` - Accept a match
- `POST /api/matches/<id>/reject/` - Reject a match

### Interests
- `POST /api/interests/send/` - Send interest to user
- `POST /api/interests/<id>/respond/` - Respond to interest (accept/reject)
- `GET /api/interests/received/` - Get received interests
- `GET /api/interests/sent/` - Get sent interests

### Messaging
- `GET /api/messaging/conversations/` - Get all conversations
- `GET /api/messaging/conversations/<id>/` - Get conversation messages
- `POST /api/messaging/messages/` - Send a message
- `POST /api/messaging/conversations/<id>/mark-read/` - Mark conversation as read
- `POST /api/messaging/conversations/start/` - Start new conversation

### Events
- `GET /api/events/upcoming/` - Get upcoming events
- `GET /api/events/<id>/` - Get event details
- `POST /api/events/register/` - Register for event
- `POST /api/events/<id>/unregister/` - Unregister from event

## Frontend Features Integrated

### Authentication Flow
- [x] Phone-based OTP login on `/login`
- [x] Protected routes with AuthContext
- [x] Token refresh on 401 responses
- [x] Logout functionality

### Dashboard
- [x] Real-time match suggestions from backend
- [x] Profile stats (views, interests, chats)
- [x] Quick stats cards

### Search
- [x] Profile search with filters (age, sampraday, city)
- [x] Send interest via API
- [x] Load profiles dynamically from backend

### Interests
- [x] View received, sent, and accepted interests
- [x] Accept/reject interests via API
- [x] Real-time interest management

### Messaging
- [x] Fetch conversations from backend
- [x] Send/receive messages
- [x] Mark conversations as read
- [x] Display unread count

## API Client Structure

All API calls use the client in `lib/api.ts` which handles:
- JWT token management
- Automatic token refresh on 401
- Bearer token injection in request headers
- Proper error handling

API services are organized by domain:
- `lib/api/auth.ts` - Authentication
- `lib/api/profiles.ts` - Profiles
- `lib/api/matches.ts` - Match suggestions
- `lib/api/interests.ts` - Interests
- `lib/api/messaging.ts` - Messaging
- `lib/api/events.ts` - Events

## State Management

Uses React Context API with `AuthContext` for user authentication state.

For component-level data fetching, use the API services directly and manage state with `useState` and `useEffect`.

## Environment Variables

Frontend: `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Backend: `backend/.env`
```
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL=sqlite:///db.sqlite3
SECRET_KEY=your-secret-key
```

## Testing the Integration

1. Start backend: `cd backend && python manage.py runserver`
2. Start frontend: `npm run dev`
3. Go to `http://localhost:3000/login`
4. Create a test user in Django admin: `http://localhost:8000/admin`
5. Send OTP and verify login
6. Navigate to dashboard to see real match suggestions

## Troubleshooting

### CORS Issues
If you see CORS errors, ensure backend has correct CORS settings:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### 401 Unauthorized
The API client automatically refreshes tokens. If issues persist, clear localStorage and re-login.

### Missing Photos
If profile photos don't load, ensure the photo upload endpoint is working on backend and photos are properly stored.

## Next Steps

1. Add form validation for registration
2. Implement real-time messaging with WebSockets
3. Add image upload with preview
4. Implement advanced matching algorithm
5. Add notifications system
6. Deploy to production (Vercel for frontend, Railway/Render for backend)
