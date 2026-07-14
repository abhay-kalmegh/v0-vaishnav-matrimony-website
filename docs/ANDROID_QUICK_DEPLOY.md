# Vaishnav Vivaah - Android Quick Deploy Guide

## TL;DR - Deploy in 5 Steps

### What You'll Do
```
Install Software (1 hour) 
    ↓
Run Setup Script (10 min)
    ↓
Generate Signing Key (5 min)
    ↓
Build AAB (15 min)
    ↓
Submit to Play Store (30 min)
    ↓
LIVE IN PLAY STORE (2-24 hours review time)
```

---

## Prerequisites Checklist

Before you start, verify you have:
- [ ] macOS 10.14+, Windows 10+, or Linux
- [ ] 50GB free storage
- [ ] Credit card (for Google Play $25 fee)
- [ ] 2-3 hours total time
- [ ] Stable internet connection

---

## PHASE 1: System Setup (1 hour)

### 1.1 Install Node.js
```bash
# Go to: https://nodejs.org/
# Download LTS version
# Follow installer

# Verify installation
node -v    # Should show v16+
npm -v     # Should show v8+
```

### 1.2 Install Java
```bash
# Go to: https://www.oracle.com/java/technologies/downloads/
# Download Java 11 or newer
# Follow installer

# Verify installation
java -version    # Should show Java 11+
```

### 1.3 Install Android Studio
```bash
# Go to: https://developer.android.com/studio
# Download and install
# Launch Android Studio

# In Android Studio:
# Tools > SDK Manager
# Install: API 34, Build Tools 34
```

### 1.4 Set Environment Variables (Required!)

**On macOS/Linux:**
```bash
# Open ~/.zshrc or ~/.bashrc
nano ~/.zshrc

# Add these lines at the end:
export JAVA_HOME=$(/usr/libexec/java_home)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Save and close (Ctrl+X, Y, Enter)

# Apply changes
source ~/.zshrc
```

**On Windows:**
```
1. Press Win + X, select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Click "New" under System variables
5. Variable name: JAVA_HOME
   Variable value: C:\Program Files\Java\jdk-11
6. Click "New" again
7. Variable name: ANDROID_HOME
   Variable value: C:\Users\YourName\AppData\Local\Android\sdk
8. Click OK
```

---

## PHASE 2: Project Setup (15 minutes)

### 2.1 Navigate to Project
```bash
cd /path/to/vaishnav-vivaah
```

### 2.2 Run Setup Script
```bash
# Make script executable
chmod +x scripts/setup-android.sh

# Run setup
./scripts/setup-android.sh

# This will:
# - Verify all tools installed
# - Install npm dependencies
# - Install Capacitor
# - Add Android platform
# - Create .env.android file
```

### 2.3 Verify Setup
```bash
# Check if android folder created
ls -la android/

# Should show: gradle files, app folder, etc.
```

---

## PHASE 3: Generate Signing Key (10 minutes)

### 3.1 Generate Keystore
```bash
# Make script executable
chmod +x scripts/generate-keystore.sh

# Run generator
./scripts/generate-keystore.sh

# When prompted, enter:
# - Keystore alias: vaishnav-vivaah
# - Password: (your secure password - min 6 chars)
# - Confirm password: (same)
# - Full name: Your Name
# - Organization: Vaishnav Vivaah
# - Country: IN (India) or your country
```

### 3.2 Update Environment File
```bash
# Edit .env.android
nano .env.android

# Update these values (from generator output):
KEYSTORE_PASSWORD=your_password_here
KEY_PASSWORD=your_password_here

# Save and close
```

### 3.3 Secure Your Credentials
```bash
# IMPORTANT: Backup and secure these
# 1. Copy keystore file to safe location:
cp android/app/vaishnav-vivaah-key.jks ~/Documents/Backup/

# 2. Save passwords in password manager
# 3. Never commit to Git!

# Add to .gitignore
echo "android/app/vaishnav-vivaah-key.jks" >> .gitignore
echo ".env.android" >> .gitignore
```

---

## PHASE 4: Build Android App (20 minutes)

### 4.1 Run Build Script
```bash
# Make script executable
chmod +x scripts/build-android.sh

# Run builder
./scripts/build-android.sh

# When prompted, select option: 3 (App Bundle AAB)
# Why? It's optimized for Play Store and smaller downloads
```

### 4.2 Wait for Build
```
Building in progress...

This may take 15-20 minutes depending on your computer.
You'll see progress output.
```

### 4.3 Verify Build Output
```bash
# After successful build, you should see:
# "App Bundle built successfully!"
# Location: android/app/build/outputs/bundle/release/app-release.aab

# Verify the file exists:
ls -lh android/app/build/outputs/bundle/release/app-release.aab

# Should show a file around 50-100MB
```

### 4.4 Optional: Test Before Submitting
```bash
# To test on emulator:
npx cap run android

# Or manually in Android Studio:
# File > Open > Select 'android' folder
# Wait for indexing
# Run > Run 'app'

# Test all features:
# - Login/registration
# - Profile creation
# - Search/matches
# - Messaging
# - Settings
```

---

## PHASE 5: Submit to Google Play Store (30 minutes + 2-24 hours review)

### 5.1 Create Google Play Account
```
1. Go to: https://play.google.com/apps/publish
2. Sign in with Google account
3. Accept developer terms
4. Pay $25 one-time fee
5. Provide payment details
6. Complete your developer profile
```

### 5.2 Create New App
```
1. Click "Create app"
2. App name: "Vaishnav Vivaah"
3. Default language: English
4. Category: Social/Dating
5. Content rating: 12+
6. Click Create
```

### 5.3 Upload App Bundle
```
1. Go to "Release" section
2. Click "Production"
3. Click "Create new release"
4. Upload file: android/app/build/outputs/bundle/release/app-release.aab
5. Review signing certificate (auto-managed by Google)
6. Click "Next"
```

### 5.4 Fill App Information
```
Title: "Vaishnav Vivaah"

Short description (80 chars):
"Find your soulmate in Krishna devotee community"

Full description (4000 chars):
"Vaishnav Vivaah is a sacred matrimony platform exclusively for 
Vaishnav Sampraday followers. Connect with spiritually aligned 
life partners who share your Krishna devotion.

Features:
- Advanced spiritual matching algorithm
- Verify profiles (Sampraday, Guru, practices)
- Connect with like-minded devotees
- Secure messaging
- Upcoming satsangs and events

Join our community of 10,000+ members worldwide!"
```

### 5.5 Add Screenshots
```
Minimum 2 required, 8 maximum:

Create these screenshots and save as PNG 1080x1920:
1. Login screen
2. Profile/matches screen
3. Message screen
4. Search filters screen
5. Settings screen
6. Success stories (if available)
7. Event screen (if available)

Upload in Google Play Console:
- Scroll to "Screenshots"
- Upload images in order
- Add captions (optional)
```

### 5.6 Add Icon & Graphics
```
App Icon (required):
- Go to Play Console
- Upload: 512x512 PNG
- File: Use your logo/icon

Feature Graphic (required):
- Size: 1024x500 PNG
- File: Create a banner showing app features
```

### 5.7 Content Rating
```
1. Scroll to "Content rating"
2. Click "Complete questionnaire"
3. Answer questions:
   - Violence: None
   - Language: None/Mild
   - Sexual content: Mild (dating app)
   - Alcohol/tobacco: None
   - Dating simulation: Yes
4. Save ratings
```

### 5.8 Privacy Policy
```
1. Scroll to "Privacy policy"
2. Paste your privacy policy URL
3. Should explain:
   - What data you collect (profiles, messages)
   - How you use data
   - User rights
   - Data security measures

If you don't have one, create simple policy at:
https://www.privacypolicytemplate.net/
```

### 5.9 Target Audience
```
1. Scroll to "Target audience"
2. Select: "Mature audiences"
3. Select countries:
   - India (primary)
   - USA
   - UK
   - Canada
   - Add more as needed
```

### 5.10 Submit for Review
```
1. Review all information
2. Go to "Release" > "Production"
3. Click "Review release"
4. Check for any blocking issues
5. Click "Submit"
6. Confirm submission
7. **DO NOT EDIT UNTIL APPROVAL**
```

---

## PHASE 6: Monitor Review (2-24 hours)

### 6.1 Check Review Status
```
In Google Play Console:
1. Go to "Release" > "Production"
2. Check status (usually shows):
   - "In review" (2-24 hours)
   - "Approved" (READY!)
   - "Rejected" (needs fixes)
```

### 6.2 If Approved
```
Congratulations! Your app is now LIVE!
- Available in Google Play Store
- Accessible worldwide (or in selected countries)
- Download link: play.google.com/store/apps/details?id=com.vaishnav.vivaah

Next steps:
1. Announce launch on social media
2. Share Play Store link with users
3. Monitor reviews and ratings
4. Check crash reports
5. Respond to user feedback
```

### 6.3 If Rejected
```
1. Read rejection reason carefully
2. Address the specific issue
   (common: privacy policy, screenshots, content)
3. Fix the issue
4. Resubmit with explanation
5. Typical resubmission: 2-4 hours approval
```

---

## After Going Live

### Promote Your App
```
1. Add Play Store link to website
2. Share on social media
3. Email to community
4. Ask users to rate/review
```

### Monitor Performance
```bash
# In Google Play Console:
- Check daily: Installs, uninstalls
- Check weekly: Ratings, reviews
- Check monthly: Crashes, ANRs (app not responding)
```

### Update Management
```
To push an update:
1. Update code in Next.js
2. Run: npm run build
3. Run: npx cap sync android
4. Rebuild: ./scripts/build-android.sh (option 3)
5. Upload new AAB in Play Console
6. New version live in 2-24 hours
```

---

## Emergency Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
cd android
./gradlew clean
./gradlew bundleRelease
cd ..
```

### API Not Connecting
```
1. Check backend is running
2. Verify API URL in .env.android
3. Check backend CORS settings
4. Test API in browser/Postman first
```

### App Crashes on Launch
```
1. Check Android Studio Logcat for errors
2. Connect phone with USB debugging
3. Run: npx cap run android
4. Check error logs in console
```

### Play Store Rejection
```
1. Read rejection reason
2. Address specific issue
3. Check PLAYSTORE_SUBMISSION_CHECKLIST.md
4. Make changes
5. Resubmit
```

---

## Success Indicators

When complete, you should have:
- [ ] App live in Google Play Store
- [ ] Download link: play.google.com/store/apps/details?id=com.vaishnav.vivaah
- [ ] App showing in search results
- [ ] Installation working on Android devices
- [ ] All features functioning
- [ ] Positive user reviews starting
- [ ] Zero crashes reported

---

## Quick Reference

| Task | Time | Command |
|------|------|---------|
| System setup | 1 hour | Manual install |
| Project setup | 10 min | `./scripts/setup-android.sh` |
| Generate key | 5 min | `./scripts/generate-keystore.sh` |
| Build app | 20 min | `./scripts/build-android.sh` |
| Submit | 30 min | Manual in Play Console |
| Review | 2-24h | Google Play review |
| **LIVE** | - | **APP IN STORE** |

---

## Common Questions

**Q: Do I need a Mac?**
A: No, any computer with Android SDK works (Mac, Windows, Linux)

**Q: How much does it cost?**
A: $25 one-time Google Play registration fee + payment card

**Q: Can I submit multiple times?**
A: Yes, unlimited updates after first submission

**Q: How long is review?**
A: Usually 2-3 hours, max 24 hours

**Q: What if it's rejected?**
A: Fix the issue and resubmit in 2-4 hours

**Q: How do I update my app?**
A: Make changes, rebuild APK, upload new version

**Q: Can users review my app?**
A: Yes, after 1-2 weeks in store

**Q: How many users can use it?**
A: Unlimited on Google Play

---

## Support

- **Android Issues:** https://developer.android.com
- **Play Store Help:** https://support.google.com/googleplay
- **More Details:** ANDROID_DEPLOYMENT.md
- **Requirements:** ANDROID_REQUIREMENTS.md
- **Submission Checklist:** PLAYSTORE_SUBMISSION_CHECKLIST.md

---

**You've got this! From start to live: 1-2 days. Good luck!**
