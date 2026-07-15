# CRITICAL: V0 BRANCH CONFIGURATION - READ FIRST

## Current Issue

V0 keeps switching back to `v0/abhaykalmegh-4712-9bc1885f` (broken branch) instead of using `feature/POO2` (working branch).

## Solution: Manual V0 Configuration

You MUST manually configure V0 to use ONLY `feature/POO2`:

### Step 1: Open V0 Settings
1. Click the **Settings** icon (⚙️) in the top right of v0.app
2. Go to the **Git** tab (or **Repository** section)

### Step 2: Select feature/POO2 Branch
1. Look for "Base Branch" or "Branch" dropdown
2. **Clear any existing branch selection**
3. **Select: `feature/POO2`** from the list
4. Click **Save** or **Apply**

### Step 3: Wait for Reload
- V0 will reload and fetch code from `feature/POO2`
- You should see the branch indicator change to `feature/POO2`

### Step 4: Verify in Terminal
After reload, open terminal and confirm:
```bash
git branch
# Should show: * feature/POO2 (active)
# Should NOT show v0/abhaykalmegh-4712-9bc1885f as active
```

## What You Should See

**After correct configuration:**
- Branch indicator in top right shows: `feature/POO2`
- Terminal shows: `On branch feature/POO2`
- All commits go to `origin/feature/POO2`
- No more push errors

## Files in feature/POO2

✅ Frontend (Next.js)  
✅ Android (Capacitor)  
✅ Backend (Django)  
✅ API Integration  
✅ All Audit Documentation  

## DO NOT USE

❌ `v0/abhaykalmegh-4712-9bc1885f` - BROKEN (rebase conflicts)  
❌ `main` - OLD CODE  
❌ `feature/POO1` - Not the right branch  

## If You See This Error

```
Failed to push to v0/abhaykalmegh-4712-9bc1885f
```

**This means V0 is on the WRONG branch.**

Repeat steps 1-4 above to switch to `feature/POO2`.

## Terminal Commands (if needed)

If manual switching doesn't work, use these terminal commands:

```bash
# Check current branch
git branch

# Switch to feature/POO2
git checkout feature/POO2

# Pull latest
git pull origin feature/POO2

# Verify correct branch
git branch -vv
```

## Support

If problems persist:
1. Close V0 completely (refresh the page)
2. Wait 30 seconds
3. Re-open V0
4. Try switching branch again through Settings

## FINAL CHECKLIST

Before starting any work:

- [ ] V0 shows `feature/POO2` in branch indicator
- [ ] Terminal shows `On branch feature/POO2`
- [ ] Last commit message starts with "Add manual branch switching guide"
- [ ] No error messages about `v0/abhaykalmegh-4712-9bc1885f`
- [ ] Working tree is clean (`git status` shows nothing to commit)
