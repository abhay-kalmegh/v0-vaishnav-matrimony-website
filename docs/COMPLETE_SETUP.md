# Complete Setup Guide - Vaishnav Vivaah Matrimony Platform

## Project Overview

**Vaishnav Vivaah** is a full-stack matrimony platform designed specifically for Krishna devotees and Vaishnav Sampraday followers.

- **Frontend**: Next.js 16 + React + Tailwind CSS (Port 3000)
- **Backend**: Django REST Framework (Port 8000)
- **Database**: PostgreSQL (or SQLite for dev)
- **Authentication**: OTP-based with JWT tokens
- **Hosting Ready**: Deployable to Vercel (frontend) and Railway/Render (backend)

## Quick Start (5 minutes)

### Option 1: Automated Setup (Linux/Mac)
```bash
chmod +x quick-start.sh
./quick-start.sh
```

Then open **two terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit: `http://localhost:3000`

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_sampradays
python manage.py seed_plans
python manage.py createsuperuser
python manage.py runserver
```

Backend: `http://localhost:8000`
Admin: `http://localhost:8000/admin`

#### Frontend Setup
```bash
cd ..
npm install
npm run dev
```

Frontend: `http://localhost:3000`

## Test Credentials

**Development OTP Login:**
- Phone: Any 10-digit number (e.g., `9876543210`)
- OTP: Any 6-digit number (e.g., `123456`)

**Django Admin:**
- Create superuser with `python manage.py createsuperuser`
- Login at `http://localhost:8000/admin`

## Project Structure

```
vaishnav-matrimony/
│
├── frontend/
│   ├── app/                    # Next.js app router
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── login/              # OTP login page
│   │   ├── register/           # 6-step registration
│   │   └── layout.tsx          # Root layout with AuthProvider
│   │
│   ├── components/             # React components
│   │   ├── landing/            # Landing page sections
│   │   ├── dashboard/          # Dashboard feature components
│   │   └── ui/                 # shadcn/ui components
│   │
│   ├── lib/
│   │   ├── api.ts              # Axios client with JWT auth
│   │   ├── api/                # API service modules
│   │   ├── context/            # React Context (Auth)
│   │   └── components/         # Shared components
│   │
│   ├── .env.local              # Frontend env (configured)
│   ├── package.json            # Dependencies
│   └── tailwind.config.ts      # Tailwind config
│
├── backend/
│   ├── config/                 # Django config
│   │   ├── settings.py         # Django settings (JWT, CORS, DB)
│   │   ├── urls.py             # URL router
│   │   ├── wsgi.py             # WSGI server
│   │   └── celery.py           # Async tasks
│   │
│   ├── apps/                   # Django apps
│   │   ├── accounts/           # Users, OTP, JWT auth
│   │   ├── profiles/           # User profiles, search
│   │   ├── spirituality/       # Sampraday, Gurus
│   │   ├── matches/            # Match suggestions
│   │   ├── interests/          # Interest management
│   │   ├── messaging/          # Messaging system
│   │   ├── events/             # Events
│   │   ├── subscriptions/      # Subscription plans
│   │   ├── verification/       # Profile verification
│   │   ├── notifications/      # In-app notifications
│   │   └── success_stories/    # Success stories
│   │
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Backend env template
│   ├── manage.py               # Django CLI
│   └── db.sqlite3              # Development database
│
├── INTEGRATION_GUIDE.md        # Setup & API documentation
├── INTEGRATION_SUMMARY.md      # Integration overview
├── README_API_INTEGRATION.md   # Detailed API architecture
├── COMPLETE_SETUP.md           # This file
└── quick-start.sh              # Automated setup script
```

## Frontend Features (Implemented)

### Public Pages
- ✅ Landing page with hero, features, testimonials
- ✅ About page
- ✅ Contact form
- ✅ Success stories
- ✅ Events listing

### Authentication
- ✅ OTP-based login
- ✅ 6-step registration wizard
- ✅ Protected routes
- ✅ Auto token refresh

### Dashboard (Protected)
- ✅ Dashboard with real match suggestions
- ✅ Profile search with advanced filters
- ✅ Interest management (receive/send/accept)
- ✅ Real-time messaging
- ✅ Settings & preferences
- ✅ Profile view & editing
- ✅ Events discovery & registration

## Backend Features (Implemented)

### Database Models
- ✅ Custom User model (phone-based)
- ✅ Profile & ProfilePhoto
- ✅ Spirituality (Sampraday, Guru, SpiritualProfile)
- ✅ MatchSuggestion with compatibility scoring
- ✅ Interest (send/receive/respond)
- ✅ Conversation & Message
- ✅ Event & EventRegistration
- ✅ SubscriptionPlan & Subscription
- ✅ Verification (documents)
- ✅ Notification

### APIs Implemented
- ✅ Authentication (OTP, JWT)
- ✅ Profile management & search
- ✅ Match suggestions with engine
- ✅ Interest management (CRUD)
- ✅ Messaging (conversations & messages)
- ✅ Events (list, register, unregister)
- ✅ Subscriptions & payments
- ✅ Verification workflow
- ✅ Notifications

## API Endpoints

### Auth
```
POST /api/auth/send-otp/           - Send OTP to phone
POST /api/auth/verify-otp/         - Verify OTP & get tokens
POST /api/auth/register/           - Register new user
POST /api/auth/token/refresh/      - Refresh JWT token
GET  /api/auth/me/                 - Get current user
```

### Profiles
```
GET  /api/profiles/me/             - Get my profile
PATCH /api/profiles/me/            - Update my profile
GET  /api/profiles/<id>/           - Get profile by ID
GET  /api/profiles/search/         - Search with filters
POST /api/profiles/<id>/upload-photo/ - Upload photo
```

### Matches
```
GET  /api/matches/suggestions/     - Get match suggestions
GET  /api/matches/<id>/            - Get match details
POST /api/matches/<id>/accept/     - Accept match
POST /api/matches/<id>/reject/     - Reject match
```

### Interests
```
POST /api/interests/send/          - Send interest
POST /api/interests/<id>/respond/  - Accept/reject interest
GET  /api/interests/received/      - Get received interests
GET  /api/interests/sent/          - Get sent interests
```

### Messaging
```
GET  /api/messaging/conversations/ - Get all conversations
GET  /api/messaging/conversations/<id>/ - Get messages
POST /api/messaging/messages/      - Send message
POST /api/messaging/conversations/<id>/mark-read/ - Mark read
```

### Events
```
GET  /api/events/upcoming/         - Get upcoming events
GET  /api/events/<id>/             - Get event details
POST /api/events/register/         - Register for event
POST /api/events/<id>/unregister/  - Unregister
```

## Testing the Integration

### 1. Test Login Flow
```
1. Visit http://localhost:3000/login
2. Phone: 9876543210
3. Click "Send OTP"
4. OTP: 123456 (any 6 digits)
5. Click "Verify & Login"
6. Should redirect to /dashboard
```

### 2. Test Search & Interests
```
1. Go to /dashboard/search
2. Set filters (age, sampraday)
3. Click "Apply Filters"
4. See profiles from database
5. Click "Interest" to send interest
```

### 3. Test Messaging
```
1. Go to /dashboard/messages
2. Select a conversation
3. Type & send a message
4. Verify message appears
```

### 4. Test API Directly
```bash
# Get token
curl -X POST http://localhost:8000/api/auth/verify-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"123456"}'

# Use token
curl -X GET http://localhost:8000/api/matches/suggestions/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Deployment

### Frontend (Vercel)
```bash
# Connect GitHub repo to Vercel
# Auto-deploys on every git push

# Set environment variables in Vercel:
NEXT_PUBLIC_API_URL=https://your-api.com/api
```

### Backend (Railway/Render)

**Railway:**
```bash
# Connect GitHub, select repo
# Set environment variables
# Auto-deploys on push
```

**Environment Variables for Production:**
```
DEBUG=False
SECRET_KEY=your-production-secret
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com

DATABASE_URL=postgresql://user:pass@host/db
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

## Troubleshooting

### Backend Issues

**Problem**: `python: can't open file 'manage.py'`
- **Solution**: Make sure you're in the `backend/` directory

**Problem**: `Module not found` errors
- **Solution**: Run `pip install -r requirements.txt`

**Problem**: `Database locked` or migration errors
- **Solution**: 
  ```bash
  rm db.sqlite3
  python manage.py migrate
  ```

### Frontend Issues

**Problem**: `Cannot find module '@/components/ui/...'`
- **Solution**: Ensure shadcn/ui components are installed

**Problem**: Blank page on load
- **Solution**: Check browser console for errors, ensure backend is running

**Problem**: 401 Unauthorized on requests
- **Solution**: Ensure .env.local has correct API_URL

**Problem**: CORS errors
- **Solution**: Check backend CORS_ALLOWED_ORIGINS includes frontend URL

## Next Steps

### Phase 1: Core Features (In Progress)
- [x] Authentication system
- [x] Profile management
- [x] Match suggestions
- [x] Interest management
- [x] Messaging
- [ ] Photo uploads
- [ ] Advanced search filters

### Phase 2: Enhancement
- [ ] Real-time notifications with WebSockets
- [ ] Advanced matching algorithm
- [ ] Subscription management
- [ ] Payment integration (Stripe)
- [ ] Email notifications

### Phase 3: Scale
- [ ] Admin dashboard
- [ ] Analytics
- [ ] Performance optimization
- [ ] Mobile app (React Native)
- [ ] Video verification

## Support

- **Documentation**: See `INTEGRATION_GUIDE.md` and `README_API_INTEGRATION.md`
- **Backend Docs**: Run backend and visit `/api/docs/` for Swagger
- **Issues**: Check troubleshooting section above
- **Code Quality**: Run tests with `pytest` (backend) and `jest` (frontend)

## Technology Stack

### Frontend
- Next.js 16 (App Router)
- React 19.2
- TypeScript
- Tailwind CSS v4
- Axios
- Lucide Icons
- shadcn/ui

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL / SQLite
- JWT Authentication
- Celery (async tasks)
- Redis (caching)
- Swagger/OpenAPI

## License

All rights reserved. Commercial use requires permission.

---

## Quick Command Reference

```bash
# Frontend
npm run dev              # Start dev server
npm run build          # Build for production
npm run lint           # Run linting

# Backend
python manage.py runserver          # Start dev server
python manage.py migrate            # Run migrations
python manage.py createsuperuser    # Create admin
python manage.py test               # Run tests
python manage.py seed_sampradays    # Seed data

# Database
python manage.py makemigrations     # Create migration
python manage.py sqlmigrate app 0001  # View SQL
python manage.py dbshell            # Access DB
```

---

**Ready to launch your matrimony platform!** 🎉

Start with the quick setup, test the APIs, and deploy to production when ready.

Questions? Check the integration guides or inspect the code comments.
