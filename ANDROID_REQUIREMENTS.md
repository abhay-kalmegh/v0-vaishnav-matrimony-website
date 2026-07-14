# Android Deployment - Requirements & Setup

## What You Need from Your Side

### 1. System Requirements

#### Hardware
- [ ] Computer with at least 8GB RAM (minimum: 4GB)
- [ ] 50GB free storage space
- [ ] macOS, Windows, or Linux

#### Software to Install
- [ ] Node.js 16+ (https://nodejs.org/)
- [ ] Java Development Kit (JDK) 11+ (https://www.oracle.com/java/)
- [ ] Android Studio (https://developer.android.com/studio)
- [ ] Git (optional, for version control)

**Installation Verification:**
```bash
# Check Node.js
node -v    # Should show v16+

# Check npm
npm -v     # Should show 8+

# Check Java
java -version    # Should show Java 11+

# After Android Studio installation
echo $ANDROID_HOME    # Should show SDK path
```

### 2. Android SDK Components

These are automatically installed with Android Studio, but verify:
- [ ] Android SDK Platform Tools
- [ ] Android SDK Build Tools (34+)
- [ ] Android SDK Platform (API 34)
- [ ] Android Emulator
- [ ] Intel HAXM or Hypervisor Framework

**Install via Android Studio:**
1. Open Android Studio
2. Tools > SDK Manager
3. Install: Build Tools, Platform Tools, API 34+

### 3. Google Play Developer Account

#### Cost
- [ ] $25 one-time registration fee
- [ ] Payment method required (credit/debit card)

#### Setup Steps
1. Go to: https://play.google.com/apps/publish
2. Sign in with Google Account
3. Accept developer terms
4. Provide payment information
5. Complete developer profile

### 4. Credentials to Prepare

#### Google Developer Account Credentials
- [ ] Google Account email
- [ ] Google Account password
- [ ] Phone number for 2FA (recommended)

#### App Signing Credentials
After running setup script, you'll have:
- [ ] Keystore file path: `android/app/vaishnav-vivaah-key.jks`
- [ ] Keystore password
- [ ] Key alias: `vaishnav-vivaah`
- [ ] Key password

**Store these securely:**
- Save passwords in a password manager (1Password, LastPass, etc.)
- Backup keystore file in secure location
- Never commit to Git
- Never share with anyone

### 5. App Assets

#### Required Images
- [ ] App Icon: 512x512 PNG
- [ ] Feature Graphic: 1024x500 PNG
- [ ] 2-8 Screenshots: 1080x1920 PNG/JPEG

#### Required Information
- [ ] App Title: "Vaishnav Vivaah"
- [ ] Short Description (80 chars)
- [ ] Full Description (4000 chars)
- [ ] Privacy Policy URL
- [ ] Terms of Service URL (optional)

### 6. Backend API Ready

Ensure Django backend is:
- [ ] Running and accessible
- [ ] Database configured and migrated
- [ ] All API endpoints working
- [ ] HTTPS enabled (or development mode configured)
- [ ] CORS properly configured for mobile

### 7. Environment Variables

Create `.env.android` file with:
```
KEYSTORE_PATH=android/app/vaishnav-vivaah-key.jks
KEYSTORE_PASSWORD=your_keystore_password
KEY_ALIAS=vaishnav-vivaah
KEY_PASSWORD=your_key_password
API_URL=https://your-backend-url.com/api
```

## Step-by-Step Setup Process

### Step 1: Prepare Your Computer (30 minutes)

```bash
# 1.1 Install Node.js (if not installed)
# Go to: https://nodejs.org/
# Download LTS version and install

# 1.2 Install Java (if not installed)
# Go to: https://www.oracle.com/java/technologies/downloads/
# Download Java 11 or newer

# 1.3 Install Android Studio
# Go to: https://developer.android.com/studio
# Install and launch

# 1.4 Configure Android SDK
# Open Android Studio > Tools > SDK Manager
# Install API 34 and Build Tools 34
```

### Step 2: Clone/Setup Project (5 minutes)

```bash
# Get your project (if using Git)
git clone https://github.com/your-org/vaishnav-vivaah.git
cd vaishnav-vivaah

# Or copy your existing project
# Then navigate to project directory
cd /path/to/vaishnav-vivaah
```

### Step 3: Run Setup Script (10 minutes)

```bash
# Make script executable
chmod +x scripts/setup-android.sh

# Run setup
./scripts/setup-android.sh

# This will:
# - Verify prerequisites
# - Install Node dependencies
# - Install Capacitor
# - Add Android platform
# - Create .env.android file
```

### Step 4: Generate Signing Key (5 minutes)

```bash
# Make script executable
chmod +x scripts/generate-keystore.sh

# Run keystore generator
./scripts/generate-keystore.sh

# You'll be prompted for:
# - Keystore alias (default: vaishnav-vivaah)
# - Keystore password
# - Full name
# - Organization
# - Country code

# This creates: android/app/vaishnav-vivaah-key.jks
```

### Step 5: Edit Environment File (2 minutes)

```bash
# Edit .env.android
nano .env.android  # or use your editor

# Add your keystore credentials:
KEYSTORE_PASSWORD=your_password_from_step_4
KEY_PASSWORD=your_password_from_step_4

# Save and close
```

### Step 6: Build Android App (15-20 minutes)

```bash
# Make build script executable
chmod +x scripts/build-android.sh

# Run build script
./scripts/build-android.sh

# You'll see options:
# 1) Debug APK (for testing)
# 2) Release APK (for Play Store)
# 3) App Bundle AAB (recommended)

# Choose option 3 for Play Store submission
# This creates: android/app/build/outputs/bundle/release/app-release.aab
```

### Step 7: Create Google Play Account (30 minutes)

1. Go to: https://play.google.com/apps/publish
2. Sign in with Google account
3. Accept terms
4. Complete payment ($25)
5. Fill developer profile

### Step 8: Submit to Play Store (30 minutes)

1. Create new app in Play Console
2. Upload AAB file
3. Add app details
4. Add screenshots
5. Add privacy policy
6. Submit for review

**Expected Review Time:** 2-3 hours (up to 24 hours)

## Troubleshooting

### Issue: "Java not found"
**Solution:**
```bash
# Install Java
# macOS: brew install openjdk@11
# Ubuntu: sudo apt-get install openjdk-11-jdk
# Windows: Download from https://www.oracle.com/java/

# Set JAVA_HOME
export JAVA_HOME=/path/to/java
# Add to ~/.bashrc or ~/.zshrc permanently
```

### Issue: "ANDROID_HOME not set"
**Solution:**
```bash
# Find Android SDK
# macOS: ~/Library/Android/sdk
# Linux: ~/Android/Sdk
# Windows: C:\Users\YourName\AppData\Local\Android\sdk

# Set environment variable
export ANDROID_HOME=~/Library/Android/sdk
# Add to ~/.bashrc or ~/.zshrc permanently
```

### Issue: "Build fails - out directory not found"
**Solution:**
```bash
# Rebuild Next.js static export
npm run build

# Verify 'out' directory created
ls -la out/
```

### Issue: "Keystore file not found"
**Solution:**
```bash
# Run keystore generator
./scripts/generate-keystore.sh

# Verify file created
ls -la android/app/vaishnav-vivaah-key.jks
```

### Issue: "gradle build fails"
**Solution:**
```bash
# Clear Gradle cache
cd android
./gradlew clean
./gradlew build

# If still fails, check logs
cd ..
./scripts/build-android.sh
```

## File Structure After Setup

```
vaishnav-vivaah/
├── capacitor.config.ts (Capacitor configuration)
├── android/ (Android native code)
│   ├── app/
│   │   ├── build.gradle (Build configuration)
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── java/.../MainActivity.java
│   │   └── vaishnav-vivaah-key.jks (Signing key)
│   ├── gradle/
│   └── gradlew (Gradle wrapper)
├── out/ (Next.js static build)
├── scripts/
│   ├── setup-android.sh
│   ├── build-android.sh
│   └── generate-keystore.sh
├── .env.android (Your credentials)
└── ...other project files
```

## Next Steps After Setup

1. **Test on Emulator:**
   ```bash
   # Open Android Studio
   # Tools > AVD Manager
   # Create/launch emulator
   # Then run: npm run android
   ```

2. **Test on Physical Device:**
   - Connect Android phone via USB
   - Enable Developer Mode
   - Enable USB Debugging
   - Run: `npx cap run android`

3. **Review Before Submission:**
   - Check PLAYSTORE_SUBMISSION_CHECKLIST.md
   - Prepare all required screenshots
   - Write app description

4. **Submit to Play Store:**
   - Follow: PLAYSTORE_SUBMISSION_CHECKLIST.md
   - Upload AAB file
   - Complete all required fields

## Security Best Practices

- [ ] Never commit `.env.android` to Git
- [ ] Never commit `vaishnav-vivaah-key.jks` to Git
- [ ] Store keystore password securely (password manager)
- [ ] Use different passwords for keystore and key
- [ ] Backup keystore file separately
- [ ] Don't share credentials with anyone
- [ ] Rotate credentials annually
- [ ] Use 2FA on Google Play account

## Support

- **Issues?** Check ANDROID_DEPLOYMENT.md for detailed troubleshooting
- **Questions?** Refer to Android docs: https://developer.android.com
- **Google Play?** Help: https://support.google.com/googleplay/android-developer

---

**Total Setup Time:** ~2 hours first time (mostly software installation)
**Subsequent Builds:** ~15-20 minutes
**Play Store Review:** 2-24 hours
**Total to Live:** 8-16 days
