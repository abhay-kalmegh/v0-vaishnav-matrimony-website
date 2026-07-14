# Deployment Checklist - Vaishnav Vivaah

## Pre-Deployment Testing ✅

### Frontend Testing
- [ ] Landing page loads without errors
- [ ] Navigation works on all pages
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Login page functional
- [ ] All dashboard pages load
- [ ] Forms submit and validate correctly
- [ ] Dark mode toggles properly
- [ ] No console errors or warnings

### Backend Testing
- [ ] Migrations run successfully: `python manage.py migrate`
- [ ] Seed data loads: `python manage.py seed_sampradays`
- [ ] Admin interface accessible: http://localhost:8000/admin
- [ ] API documentation available: http://localhost:8000/api/docs/
- [ ] All endpoints return correct status codes
- [ ] CORS headers present in responses
- [ ] Token refresh working (401 triggers refresh)

### Integration Testing
- [ ] Login flow: Send OTP → Verify OTP → Get token → Access dashboard
- [ ] Dashboard: Loads real matches from backend
- [ ] Search: Filters work, results from backend
- [ ] Interests: Send, receive, accept/reject working
- [ ] Messaging: Send/receive messages
- [ ] Protected routes: Redirect unauthorized users to login

### Database Testing
- [ ] PostgreSQL/SQLite running
- [ ] All migrations applied
- [ ] Test user created
- [ ] Seed data populated
- [ ] Admin can view all models

---

## Frontend Deployment (Vercel) 

### Step 1: Prepare GitHub Repository
- [ ] Code pushed to GitHub
- [ ] Branch: `main` is default branch
- [ ] All sensitive data in `.env.local` (not in repo)
- [ ] Build successful: `npm run build`
- [ ] No console errors in dev: `npm run dev`

### Step 2: Connect to Vercel
- [ ] Go to vercel.com
- [ ] Click "New Project"
- [ ] Select GitHub repository
- [ ] Configure project:
  - [ ] Framework: Next.js (auto-detected)
  - [ ] Root Directory: `./` (or appropriate path)
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`

### Step 3: Environment Variables
In Vercel Project Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_BACKEND_URL=https://your-api-domain.com
```

### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (~2 minutes)
- [ ] View deployment logs
- [ ] Test deployed frontend at vercel URL
- [ ] Verify environment variables loaded

### Step 5: Custom Domain (Optional)
- [ ] Go to Vercel Settings → Domains
- [ ] Add custom domain (e.g., vaishnav.com)
- [ ] Update DNS records
- [ ] Wait for SSL certificate
- [ ] Test custom domain

### Post-Deployment
- [ ] Auto-deploys enabled (on every git push)
- [ ] Preview deployments enabled
- [ ] Analytics enabled
- [ ] Monitoring enabled

---

## Backend Deployment (Railway/Render)

### Option A: Railway

#### Step 1: Prepare GitHub
- [ ] Code pushed to GitHub
- [ ] `requirements.txt` updated with all dependencies
- [ ] `.env.example` contains all required variables
- [ ] `Procfile` created (optional):
  ```
  web: gunicorn config.wsgi
  worker: celery -A config worker
  ```

#### Step 2: Connect Railway
- [ ] Go to railway.app
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub"
- [ ] Connect GitHub and select repository
- [ ] Select branch: `main`

#### Step 3: Configure Services
Create services:
- [ ] Web (Django app)
- [ ] PostgreSQL (database) - Railway provides plugin
- [ ] Redis (optional, for caching)

#### Step 4: Environment Variables
In Railway Project → Variables:
```
DEBUG=False
SECRET_KEY=<generate-strong-key>
ALLOWED_HOSTS=your-domain.com,your-api.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com

# Database (auto-populated from PostgreSQL plugin)
DATABASE_URL=postgresql://...

# Email (configure before production)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# JWT
JWT_SECRET_KEY=<generate-strong-key>
JWT_EXPIRATION_DELTA=3600

# Redis (if using)
REDIS_URL=redis://...

# Secure settings for production
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
```

#### Step 5: Deploy
- [ ] Railway auto-deploys from GitHub
- [ ] Monitor build logs
- [ ] Wait for deployment to complete
- [ ] Test API endpoint

#### Step 6: Run Migrations
In Railway dashboard, click Web service:
- [ ] Open Command Tab
- [ ] Run: `python manage.py migrate`
- [ ] Run: `python manage.py seed_sampradays`
- [ ] Run: `python manage.py seed_plans`
- [ ] Create superuser: `python manage.py createsuperuser`

#### Post-Deployment
- [ ] View deployed API at your URL
- [ ] Test admin at `/admin`
- [ ] Test API docs at `/api/docs/`
- [ ] Setup domain (Settings → Domains)

---

### Option B: Render

#### Step 1: Prepare Code
Same as Railway Step 1

#### Step 2: Create Web Service
- [ ] Go to render.com
- [ ] Click "New +"
- [ ] Select "Web Service"
- [ ] Connect GitHub
- [ ] Select repository and branch

#### Step 3: Configure
- [ ] Name: `vaishnav-vivaah-api`
- [ ] Environment: `Python`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `gunicorn config.wsgi:application`
- [ ] Instance Type: Standard

#### Step 4: Environment Variables
Same as Railway Step 4

#### Step 5: Add PostgreSQL
- [ ] Click "New +"
- [ ] Select "PostgreSQL"
- [ ] Name: `vaishnav-db`
- [ ] Copy internal database URL to web service env

#### Step 6: Deploy
- [ ] Click "Deploy"
- [ ] Monitor logs
- [ ] Wait for build completion

#### Step 7: Run Migrations
- [ ] Click Web Service
- [ ] Open Shell
- [ ] Run: `python manage.py migrate`
- [ ] Run: `python manage.py seed_sampradays`
- [ ] Run: `python manage.py createsuperuser`

---

## Database Setup (PostgreSQL)

### Local Development
```bash
# Install PostgreSQL
# Create database
createdb vaishnav_matrimony

# In backend/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/vaishnav_matrimony

# Run migrations
python manage.py migrate
python manage.py seed_sampradays
```

### Production (Railway/Render)
- [ ] PostgreSQL plugin installed
- [ ] DATABASE_URL environment variable set
- [ ] Migrations run successfully
- [ ] Seed data loaded
- [ ] Backup enabled (automatic on Railway/Render)

---

## Email Configuration

### Gmail (Free)
1. [ ] Enable 2-factor authentication
2. [ ] Generate App Password (not regular password)
3. [ ] Set environment variables:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   EMAIL_USE_TLS=True
   DEFAULT_FROM_EMAIL=your-email@gmail.com
   ```

### SendGrid (Recommended)
1. [ ] Create SendGrid account
2. [ ] Create API key
3. [ ] Set environment variables:
   ```
   EMAIL_BACKEND=sendgrid_backend.SendgridBackend
   SENDGRID_API_KEY=SG.xxxxx
   DEFAULT_FROM_EMAIL=noreply@vaishnav.com
   ```

### Mailgun
1. [ ] Create Mailgun account
2. [ ] Verify domain
3. [ ] Set environment variables:
   ```
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_HOST_USER=postmaster@yourdomain.com
   EMAIL_HOST_PASSWORD=your-mailgun-key
   ```

---

## SSL/HTTPS Configuration

### Vercel Frontend
- [ ] Automatic SSL certificate (included)
- [ ] HTTPS enabled by default
- [ ] Auto-renewal handled by Vercel

### Railway/Render Backend
- [ ] Automatic SSL certificate (included)
- [ ] HTTPS enabled by default
- [ ] Auto-renewal handled by platform

### Custom Domain
- [ ] Update DNS CNAME records
- [ ] Wait for SSL cert generation (5-30 minutes)
- [ ] Verify HTTPS working

---

## Performance Optimization

### Frontend
- [ ] Minification enabled (default in Next.js build)
- [ ] Image optimization enabled
- [ ] CSS purged (Tailwind)
- [ ] Code splitting working
- [ ] Lazy loading components
- [ ] Caching headers set correctly

### Backend
- [ ] Database indexes created on search fields
- [ ] Pagination implemented (20 per page default)
- [ ] Caching enabled (Redis)
- [ ] Compression enabled (gzip)
- [ ] Database connection pooling
- [ ] Static files served by CDN (optional)

### Monitoring
- [ ] Analytics enabled (Vercel)
- [ ] Error tracking (Sentry recommended)
- [ ] Performance monitoring
- [ ] Log aggregation

---

## Security Checklist

### Frontend Security
- [ ] Remove console.log statements (debug logs)
- [ ] No hardcoded API keys
- [ ] HTTPS enforced
- [ ] CSRF tokens in forms
- [ ] XSS protection (React sanitization)
- [ ] CSP headers configured
- [ ] Security headers set

### Backend Security
- [ ] DEBUG=False in production
- [ ] SECRET_KEY is strong and random
- [ ] ALLOWED_HOSTS configured correctly
- [ ] CORS_ALLOWED_ORIGINS restricted
- [ ] Database password is strong
- [ ] JWT secret is strong
- [ ] SSL/HTTPS enforced
- [ ] Rate limiting enabled (optional)
- [ ] SQL injection prevented (ORM)
- [ ] CSRF protection enabled
- [ ] SECURE_SSL_REDIRECT=True
- [ ] SESSION_COOKIE_SECURE=True
- [ ] CSRF_COOKIE_SECURE=True

### Database Security
- [ ] Strong password
- [ ] Regular backups enabled
- [ ] Connection encrypted (SSL)
- [ ] No public access (private VPC)
- [ ] User permissions restricted

---

## Monitoring & Alerts

### Setup Error Tracking
```bash
# Install Sentry
pip install sentry-sdk

# In settings.py
import sentry_sdk
sentry_sdk.init("YOUR_SENTRY_DSN")
```

### Setup Performance Monitoring
- [ ] Enable Vercel Analytics (frontend)
- [ ] Enable Railway/Render monitoring (backend)
- [ ] Setup database query monitoring
- [ ] Track API response times

### Setup Alerts
- [ ] Downtime alerts (PagerDuty/Opsgenie)
- [ ] Error rate alerts (Sentry)
- [ ] Database alerts (Railway/Render)
- [ ] Email notification setup

---

## Post-Deployment Verification

### Test Production Environment
- [ ] Frontend loads without errors
- [ ] Backend API responding to requests
- [ ] Database connection working
- [ ] Login flow complete
- [ ] Search returning results
- [ ] Interests and messaging working
- [ ] Admin accessible
- [ ] API docs available
- [ ] SSL certificate valid
- [ ] No mixed HTTP/HTTPS content

### Monitor First Hour
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Verify all endpoints working
- [ ] Test different user flows
- [ ] Check database performance

### Communicate
- [ ] Notify team of deployment
- [ ] Update status page
- [ ] Alert users if needed
- [ ] Document any issues found

---

## Rollback Plan

If deployment fails:
1. [ ] Check deployment logs
2. [ ] Verify environment variables
3. [ ] Check database connection
4. [ ] Revert to previous commit: `git revert HEAD`
5. [ ] Push fix and redeploy
6. [ ] Monitor deployment carefully

---

## Domain & DNS

### Setup Custom Domain

#### Frontend (Vercel)
1. [ ] In Vercel: Settings → Domains
2. [ ] Add domain (e.g., vaishnav.com)
3. [ ] Note CNAME/A records
4. [ ] Update DNS provider with records
5. [ ] Wait for propagation (5 min - 48 hours)
6. [ ] Verify domain works

#### Backend (Railway/Render)
1. [ ] In platform: Settings → Domains
2. [ ] Add domain (e.g., api.vaishnav.com)
3. [ ] Update DNS CNAME
4. [ ] Wait for propagation
5. [ ] Update frontend .env NEXT_PUBLIC_API_URL

---

## Final Verification Checklist

- [ ] Frontend deploys to Vercel
- [ ] Backend deploys to Railway/Render
- [ ] Database migrations complete
- [ ] Environment variables configured
- [ ] Email service working
- [ ] SSL certificates valid
- [ ] Domain DNS configured
- [ ] Admin accessible
- [ ] API docs available
- [ ] Error tracking setup
- [ ] Performance monitoring active
- [ ] Backups enabled
- [ ] Security headers set
- [ ] HTTPS enforced
- [ ] All API endpoints tested
- [ ] Full user flow tested
- [ ] Team notified
- [ ] Documentation updated

---

## Success! 🎉

Your Vaishnav Vivaah matrimony platform is now **live in production**!

### What to Do Next
1. Monitor logs and performance
2. Gather user feedback
3. Plan feature enhancements
4. Optimize based on usage patterns
5. Regular security audits
6. Backup strategy verification

### Maintenance Schedule
- Daily: Monitor error logs
- Weekly: Check performance metrics
- Monthly: Database optimization, security review
- Quarterly: Feature planning, technical debt
- Annually: Major version upgrades

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Deployment Environment**: Production
**Status**: ✅ LIVE & OPERATIONAL

---

Good luck launching Vaishnav Vivaah! 🚀🙏
