# Quick Start Guide - Vaishnav Vivaah Matrimony Website

## 5-Minute Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL (or use SQLite for development)
- Git

### Step 1: Clone & Setup Backend (2 minutes)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run migrations
python manage.py migrate

# Seed initial data
python manage.py seed_sampradays
python manage.py seed_plans

# Create superuser (admin account)
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

**Backend running at:** http://localhost:8000

### Step 2: Setup Frontend (2 minutes)

```bash
# In a new terminal, go to project root
cd ..

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

**Frontend running at:** http://localhost:3000

### Step 3: Access the Application (1 minute)

**Landing Page:** http://localhost:3000
- Explore the home page
- Click "Get Started" or "Register"

**Registration:** http://localhost:3000/register
- Complete 6-step registration wizard
- Fill in spiritual preferences
- Choose Sampraday (tradition)

**Login:** http://localhost:3000/login
- Use registered phone number
- Enter OTP (check Django console for OTP in development)

**Dashboard:** http://localhost:3000/dashboard
- View match suggestions
- Search for profiles
- Send interests
- Message matches

**Admin Panel:** http://localhost:8000/admin
- Manage users and profiles
- View all data
- Manage events and subscriptions

---

## Testing Checklist

### ✅ Test Authentication
1. Go to `/register`
2. Fill out all fields across 6 steps
3. Submit form
4. Go to `/login`
5. Enter phone number from registration
6. Enter OTP (check Django console output)
7. Should redirect to dashboard

### ✅ Test Dashboard
1. View stats and match suggestions on dashboard
2. Click "View All Matches" to see full search
3. Try filters (age, location, sampraday)
4. Click on profile card to view details
5. Send interest to a profile
6. Check "Interests" tab to see sent interests

### ✅ Test Messaging
1. Go to "Messages" tab
2. Start a new conversation (if you have matched users)
3. Send a message
4. Verify message appears

### ✅ Test Admin
1. Go to http://localhost:8000/admin
2. Login with superuser credentials
3. Browse Users, Profiles, Interests, Events
4. Create a test event
5. Create a test success story

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```
DEBUG=True
SECRET_KEY=django-insecure-your-secret-key
DATABASE_URL=sqlite:///db.sqlite3  # Or PostgreSQL URL
ALLOWED_HOSTS=localhost,127.0.0.1
JWT_SECRET=your-jwt-secret-key
CORS_ALLOWED_ORIGINS=http://localhost:3000
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

---

## Common Issues & Solutions

### Issue: "API connection refused"
**Solution:**
- Verify Django is running: `python manage.py runserver`
- Check NEXT_PUBLIC_API_URL in .env.local matches backend URL
- Ensure CORS is enabled in Django settings

### Issue: "OTP not appearing"
**Solution:**
- Check Django console where server is running
- OTP is printed to console when EMAIL_BACKEND=console
- Or check your email if using real email backend

### Issue: "Page shows 'Loading...' forever"
**Solution:**
- Check browser console for errors (F12)
- Verify backend server is running
- Check network tab to see API requests
- Look for CORS errors

### Issue: "Admin login fails"
**Solution:**
- Create superuser: `python manage.py createsuperuser`
- Make sure you're accessing: http://localhost:8000/admin/
- Use the superuser credentials you just created

---

## File Structure

```
v0-project/
├── app/                           # Next.js pages
│   ├── (dashboard)/              # Protected pages
│   ├── login/page.tsx            # Login
│   ├── register/page.tsx         # Registration
│   └── layout.tsx                # Providers
├── components/
│   ├── dashboard/                # Dashboard components
│   ├── landing/                  # Landing page
│   └── ui/                       # UI components
├── lib/
│   ├── api/                      # API client
│   ├── context/                  # Auth context
│   └── utils.ts
├── backend/                      # Django project
│   ├── apps/
│   │   ├── accounts/            # Auth
│   │   ├── profiles/            # Profiles
│   │   ├── spirituality/        # Sampraday, Guru
│   │   ├── matches/             # Matching engine
│   │   ├── interests/           # Interest management
│   │   ├── messaging/           # Messaging
│   │   ├── events/              # Events
│   │   ├── subscriptions/       # Plans
│   │   ├── verification/        # Document verification
│   │   ├── success_stories/     # Success stories
│   │   └── notifications/       # Notifications
│   ├── config/                  # Settings
│   ├── manage.py
│   └── requirements.txt
└── public/
    └── images/                  # Images
```

---

## Key Features to Explore

### 1. Registration Wizard
- 6-step guided form
- Spiritual profile collection
- Partner preferences

### 2. Match Suggestions
- Swipeable card interface
- Compatibility scoring (87% match)
- Send interest with one tap

### 3. Advanced Search
- Filter by age, location, sampraday
- Sort by compatibility
- Browse all profiles

### 4. Messaging
- Chat with matched users
- Message history
- Read status tracking

### 5. Events
- Browse satsang events
- Register for events
- View your event registrations

### 6. Admin Panel
- Manage all users and data
- Approve verification documents
- Publish success stories
- Create events and manage subscriptions

---

## Next: Deploy to Production

Once you're comfortable with the local setup:

1. **Database Setup**
   - Configure PostgreSQL (AWS RDS, Heroku, etc.)
   - Update DATABASE_URL in .env

2. **Email Configuration**
   - Setup SendGrid, AWS SES, or similar
   - Update EMAIL_BACKEND

3. **Deploy Backend**
   - Heroku, Railway, PythonAnywhere, or your VPS
   - Set production environment variables
   - Run migrations on production

4. **Deploy Frontend**
   - Vercel, Netlify, or your CDN
   - Update NEXT_PUBLIC_API_URL to production backend
   - Enable HTTPS

5. **SSL & Security**
   - Setup HTTPS/SSL certificate
   - Configure CORS for production domain
   - Enable secure cookie flags

---

## Support

### Documentation
- See `API_INTEGRATION_COMPLETE.md` for API details
- See `PROJECT_SUMMARY.txt` for complete overview
- See `DEPLOYMENT_CHECKLIST.md` for production

### Getting Help
1. Check browser console for errors (F12)
2. Check Django console for backend errors
3. Check the documentation files
4. Review the code comments in relevant files

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Django Docs**: https://docs.djangoproject.com
- **Django REST Framework**: https://www.django-rest-framework.org
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com

---

**🎉 You're all set! Happy coding! 🙏**
