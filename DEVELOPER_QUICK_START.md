# Developer Quick Start Guide

## Getting Started

### Installation
```bash
npm install --legacy-peer-deps
```

### Development
```bash
npm run dev
# Runs on http://localhost:3000
```

### Build
```bash
npm run build
npm start  # Production
```

## Project Structure Quick Reference

```
app/
  ├── (dashboard)/          # Protected routes (need login)
  │   ├── dashboard/        # Home page
  │   ├── profile/          # Profile management
  │   ├── search/           # Search profiles
  │   ├── interests/        # Interest management
  │   ├── messages/         # Messaging
  │   └── [more routes]
  ├── login/                # Login page
  ├── register/             # Registration page
  └── layout.tsx            # Root layout

components/
  ├── dashboard/            # Page components
  │   ├── dashboard-content.tsx
  │   ├── profile-edit-content.tsx
  │   ├── profile-view-content.tsx
  │   ├── search-content.tsx
  │   ├── interests-content.tsx
  │   ├── messaging-content.tsx
  │   └── suggestions-content.tsx
  ├── ui/                   # shadcn components
  ├── protected-route.tsx   # Auth wrapper
  └── toaster.tsx          # Notifications

lib/
  ├── api/                  # API calls
  │   ├── auth.ts
  │   ├── profiles.ts
  │   ├── interests.ts
  │   ├── messaging.ts
  │   ├── matches.ts
  │   └── events.ts
  ├── context/
  │   └── auth-context.tsx  # Auth state
  └── hooks/
      └── useAuth.ts        # Auth hook
```

## Key Files to Understand

1. **lib/context/auth-context.tsx** - Authentication state management
2. **middleware.ts** - Route protection logic
3. **components/protected-route.tsx** - Auth check wrapper
4. **next.config.mjs** - Next.js configuration
5. **components/dashboard/*.tsx** - Page components with API integration

## Authentication Usage

### In Components
```tsx
import { useAuth } from '@/lib/context/auth-context'

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()
  
  if (!isAuthenticated) return <div>Not logged in</div>
  
  return <div>Hello {user?.first_name}</div>
}
```

### Login Flow
```tsx
import { useAuth } from '@/lib/context/auth-context'

export function LoginPage() {
  const { sendOtp, login } = useAuth()
  
  const handleSendOtp = async (phone) => {
    await sendOtp(phone)  // Toast notification on success/error
  }
  
  const handleLogin = async (phone, otp) => {
    await login(phone, otp)  // Redirects to dashboard on success
  }
}
```

## API Usage Pattern

### Making API Calls
```tsx
import profilesAPI from '@/lib/api/profiles'

export function ProfileComponent() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await profilesAPI.getMyProfile()
        setProfile(data)
      } catch (error) {
        console.error(error)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])
  
  if (loading) return <div>Loading...</div>
  return <div>{profile.bio}</div>
}
```

## Common API Modules

```tsx
import authAPI from '@/lib/api/auth'
import profilesAPI from '@/lib/api/profiles'
import interestsAPI from '@/lib/api/interests'
import messagingAPI from '@/lib/api/messaging'
import matchesAPI from '@/lib/api/matches'
import eventsAPI from '@/lib/api/events'
```

## Toast Notifications

```tsx
import { toast } from 'sonner'

// Success
toast.success('Profile updated!')

// Error
toast.error('Failed to update profile')

// Info
toast.info('Processing...')

// Loading
toast.loading('Saving...')
```

## Protected Routes

### Making a Route Protected
```tsx
// In page.tsx
import { ProtectedRoute } from '@/components/protected-route'

export default function MyPage() {
  return (
    <ProtectedRoute>
      <MyContent />
    </ProtectedRoute>
  )
}
```

### Require Complete Profile
```tsx
export default function MyPage() {
  return (
    <ProtectedRoute requireProfileComplete>
      <MyContent />
    </ProtectedRoute>
  )
}
```

## Adding New Features

### 1. Create API Module
```tsx
// lib/api/myfeature.ts
import apiClient from './client'

const myFeatureAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/myfeature/')
    return response.data
  },
  
  create: async (data) => {
    const response = await apiClient.post('/api/myfeature/', data)
    return response.data
  }
}

export default myFeatureAPI
```

### 2. Create Component
```tsx
// components/dashboard/myfeature-content.tsx
'use client'

import { useEffect, useState } from 'react'
import myFeatureAPI from '@/lib/api/myfeature'
import { toast } from 'sonner'

export function MyFeatureContent() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await myFeatureAPI.getAll()
        setData(result)
      } catch (error) {
        toast.error('Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

### 3. Create Page
```tsx
// app/(dashboard)/myfeature/page.tsx
import { ProtectedRoute } from '@/components/protected-route'
import { MyFeatureContent } from '@/components/dashboard/myfeature-content'

export default function MyFeaturePage() {
  return (
    <ProtectedRoute>
      <MyFeatureContent />
    </ProtectedRoute>
  )
}
```

### 4. Add Route to Navigation
Edit `app/(dashboard)/layout.tsx` and add to the navigation menu.

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution**: Run `npm install --legacy-peer-deps`

### Issue: Build failures
**Solution**: 
```bash
npm run build 2>&1 | tail -20  # Check error
npm run dev                     # Test locally
```

### Issue: API calls not working
**Solution**: 
1. Check backend is running on port 8000
2. Verify `.env.local` has correct API URL
3. Check token in browser DevTools (Application > Cookies)

### Issue: Components not rendering
**Solution**:
1. Check TypeScript errors: `npm run build`
2. Check console for React errors
3. Verify imports are correct

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Testing in Browser

### Login Page
1. Go to `http://localhost:3000/login`
2. Enter phone number
3. Check console for API response

### Protected Routes
1. Try accessing `/dashboard` without login - redirects to login
2. Login first, then access `/dashboard`

### Components
Use React DevTools to inspect component props and state.

## Performance Tips

1. Use `useAuth` instead of making API calls directly
2. Memoize expensive components with `memo()`
3. Use `useCallback` for event handlers
4. Lazy load images with Next.js Image component
5. Check DevTools Performance tab

## Debugging

### Enable Debug Logs
All API calls log with `[v0]` prefix:
```tsx
console.log('[v0] API Response:', data)
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Look for API requests to `/api/`
4. Check status codes and response payloads

### React DevTools
1. Install React DevTools extension
2. Inspect component state and props
3. Check render counts with Profiler

## Common Commands

```bash
# Development
npm run dev                # Start dev server

# Building
npm run build              # Production build
npm start                  # Start production server

# Code Quality
npm run lint               # Run ESLint (if configured)
npm run type-check         # Check TypeScript (if needed)

# Git
git status                 # Check changes
git add .                  # Stage changes
git commit -m "message"    # Commit
git push origin feature/POO2  # Push to branch
```

## Next Steps

1. Connect backend API server
2. Test login flow with real OTP
3. Test all dashboard features
4. Deploy to Vercel
5. Release Android app

## Resources

- Next.js Docs: https://nextjs.org/docs
- React Docs: https://react.dev
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com
- TypeScript: https://typescriptlang.org

## Support

For issues or questions:
1. Check existing documentation files
2. Review similar components for patterns
3. Check console logs for errors
4. Review git commit history for context
