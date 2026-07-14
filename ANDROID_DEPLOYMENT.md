# Vaishnav Vivaah - Android APK/AAB Deployment Guide

## Overview

This guide explains how to build a production-ready Android APK (Android Package) or AAB (Android App Bundle) from your existing Next.js web application using **Capacitor**, which wraps your web app as a native Android application.

Capacitor is the recommended approach because:
- ✅ Converts web apps to native mobile apps
- ✅ Supports iOS and Android from single codebase
- ✅ Maintains full access to native APIs
- ✅ Simple development and deployment workflow
- ✅ Professional app store distribution support

---

## Prerequisites

Before starting, ensure you have:

### 1. System Requirements
- **Java Development Kit (JDK) 11 or higher**
  ```bash
  java -version
  # Should show: openjdk version "11.x.x" or higher
  ```

- **Android SDK**
  - Download: https://developer.android.com/studio
  - Or install via Homebrew (macOS):
    ```bash
    brew install android-sdk
    ```

- **Android Studio** (recommended)
  - Download: https://developer.android.com/studio
  - Installs Android SDK, emulator, and build tools

- **Node.js & npm/pnpm**
  ```bash
  node -v  # Should be v18+
  npm -v   # or pnpm -v
  ```

### 2. Environment Variables

Set the following in your `.bashrc`, `.zshrc`, or system environment:

```bash
# macOS/Linux
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/emulator
export PATH=$PATH:$ANDROID_SDK_ROOT/tools
export PATH=$PATH:$ANDROID_SDK_ROOT/tools/bin
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools

# Windows (Command Prompt as Administrator)
setx JAVA_HOME "C:\Program Files\Java\jdk-11"
setx ANDROID_SDK_ROOT "%USERPROFILE%\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_SDK_ROOT%\platform-tools"
```

Verify setup:
```bash
java -version
gradle -v
adb version
```

---

## Step 1: Install Capacitor

### 1.1 Install Capacitor CLI and Core

```bash
cd /vercel/share/v0-project

# Install Capacitor globally
npm install -g @capacitor/cli

# Or install locally (preferred)
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
```

### 1.2 Initialize Capacitor Project

```bash
npx cap init "Vaishnav Vivaah" "com.vaishnav.vivaah"
```

When prompted:
- **App name**: Vaishnav Vivaah
- **App Package ID**: com.vaishnav.vivaah (unique identifier)
- **Web assets directory**: dist
- **Build before copying web assets**: No

This creates a `capacitor.config.ts` file.

### 1.3 Update Capacitor Config

Edit `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vaishnav.vivaah',
  appName: 'Vaishnav Vivaah',
  webDir: 'out', // Next.js static export directory
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    CapacitorHTTP: {
      enabled: true,
    }
  }
};

export default config;
```

---

## Step 2: Build Next.js for Production

### 2.1 Configure Next.js for Static Export

Edit `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static export
  distDir: 'out',    // Output to 'out' directory for Capacitor
  images: {
    unoptimized: true, // Static export doesn't support Image Optimization
  },
  reactCompiler: true,
  cacheComponents: true,
};

export default nextConfig;
```

### 2.2 Build the Application

```bash
npm run build
# This creates the 'out/' directory with static files
```

### 2.3 Verify Build Output

```bash
ls -la out/
# Should show index.html and other static assets
```

---

## Step 3: Add Android Platform

### 3.1 Add Android Support

```bash
npx cap add android
```

This creates an `android/` directory with a complete Android project.

### 3.2 Verify Android Project

```bash
ls -la android/
# Should contain:
# - app/        (Android app module)
# - build.gradle
# - local.properties
# - settings.gradle
```

---

## Step 4: Copy Web Assets to Android

```bash
npx cap sync android
```

This command:
- Copies web assets from `out/` to `android/app/src/main/assets/`
- Updates Android project dependencies
- Syncs Capacitor plugins

---

## Step 5: Update AndroidManifest.xml

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vaishnav.vivaah">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="false"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/title_activity_main"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="http" android:host="localhost" android:port="3000" />
                <data android:scheme="https" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>

</manifest>
```

---

## Step 6: Configure App Icons and Splash Screen

### 6.1 Replace App Icon

Place your app icon (1024x1024 PNG) at:
```
android/app/src/main/res/mipmap-nodpi/ic_launcher.png
android/app/src/main/res/mipmap-nodpi/ic_launcher_round.png
```

### 6.2 Add Splash Screen (Optional)

Place splash image at:
```
android/app/src/main/res/drawable/ic_splash.png
```

Edit `android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">Vaishnav Vivaah</string>
    <string name="title_activity_main">Vaishnav Vivaah</string>
</resources>
```

---

## Step 7: Set Up Signing Configuration

### 7.1 Create Keystore (First Time Only)

```bash
# Create a signing key (valid for 10,000 days = 27 years)
keytool -genkey -v -keystore android/vaishnav-vivaah.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias vaishnav-vivaah-key

# When prompted:
# - Keystore password: [choose a strong password]
# - Key password: [same as keystore password]
# - First/Last name: Your Name
# - Organizational Unit: Vaishnav Vivaah
# - Organization: Vaishnav Vivaah
# - City: Your City
# - State: Your State
# - Country: Your Country (2-letter code like US, IN, etc.)
```

**⚠️ IMPORTANT: Keep the keystore file and password safe. You cannot recover them!**

### 7.2 Create Signing Config

Create `android/keystore.properties`:

```properties
storeFile=vaishnav-vivaah.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=vaishnav-vivaah-key
keyPassword=YOUR_KEY_PASSWORD
```

**DO NOT COMMIT** this file to git. Add to `.gitignore`:

```bash
echo "android/keystore.properties" >> .gitignore
echo "android/**/*.keystore" >> .gitignore
```

### 7.3 Configure Build Gradle

Edit `android/app/build.gradle`:

```gradle
...
android {
    ...
    
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

---

## Step 8: Build APK for Testing

### 8.1 Build Debug APK

```bash
cd android
./gradlew assembleDebug
```

Output:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 8.2 Install on Device/Emulator

```bash
# List connected devices
adb devices

# Install APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Or using Capacitor
npx cap run android
```

---

## Step 9: Build Signed APK for Release

### 9.1 Build Release APK

```bash
cd android
./gradlew assembleRelease
```

Output:
```
android/app/build/outputs/apk/release/app-release.apk
```

### 9.2 Verify Signature

```bash
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
```

---

## Step 10: Build AAB for Google Play Store

Google Play Store now requires App Bundles (AAB) instead of APKs for new app releases.

### 10.1 Build Bundle

```bash
cd android
./gradlew bundleRelease
```

Output:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### 10.2 Verify Bundle

```bash
# List contents
unzip -l android/app/build/outputs/bundle/release/app-release.aab | head -30
```

---

## Step 11: Prepare for Google Play Store

### 11.1 Create Google Play Developer Account

1. Go to https://play.google.com/console
2. Create developer account ($25 one-time fee)
3. Accept terms and agreements

### 11.2 Create Application Entry

1. Click "Create app"
2. App name: Vaishnav Vivaah
3. Default language: English
4. App category: Lifestyle
5. Content rating: PG or appropriate rating
6. Target audience: Adults

### 11.3 Complete App Information

Fill out the required sections:
- **Title**: Vaishnav Vivaah
- **Short description**: Sacred matrimony platform for Vaishnav devotees
- **Full description**: Detailed description of your app
- **Screenshots**: At least 2 (up to 8) screenshots showing app features
- **Feature graphic**: 1024x500 PNG
- **Icon**: 512x512 PNG
- **Privacy policy URL**: Link to your privacy policy

### 11.4 Configure Pricing & Distribution

- Set price (free or paid)
- Select countries for distribution
- Configure content rating questionnaire

---

## Step 12: Upload to Google Play Store

### 12.1 Upload App Bundle

1. Go to Play Console > Your App > Release Management > App Releases
2. Click "Create release"
3. Upload `app-release.aab`
4. Add release notes:
   ```
   Version 1.0
   - Initial release of Vaishnav Vivaah matrimony platform
   - Profile creation and management
   - Advanced match suggestions
   - Spiritual compatibility matching
   - Messaging system
   - Event registration
   ```

### 12.2 Set Pricing & Distribution

1. Set minimum API level: 26 (Android 8.0+)
2. Set target API level: 34 (Android 14+)
3. Accept content ratings

### 12.3 Complete Content Rating

Answer questionnaire about app content.

### 12.4 Submit for Review

Click "Review release" and then "Start rollout"

**Note**: First release takes 2-4 hours for review. Updates typically take 1-2 hours.

---

## Step 13: Monitor App Performance

### 13.1 Track Installs

In Play Console:
- Go to Analytics > Installs
- Monitor daily active users
- Track crashes and ANRs

### 13.2 View User Reviews

- Monitor review ratings
- Respond to user feedback
- Fix reported issues

### 13.3 Monitor Crashes

- Go to Analytics > Crashes and ANRs
- Fix critical issues
- Push updates as needed

---

## Troubleshooting

### Problem: Build Fails - "SDK Location Not Found"

**Solution:**
```bash
echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties
```

### Problem: APK Not Installing - "Incompatible API Level"

**Solution:** Update `android/app/build.gradle`:
```gradle
minSdkVersion 26
targetSdkVersion 34
```

### Problem: "Gradle Sync Failed"

**Solution:**
```bash
cd android
./gradlew clean
./gradlew build
```

### Problem: "Keystore Password Incorrect"

**Solution:** Recreate keystore:
```bash
rm android/vaishnav-vivaah.keystore
keytool -genkey -v -keystore android/vaishnav-vivaah.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias vaishnav-vivaah-key
```

### Problem: App Crashes on Launch

**Solution:**
1. Check logcat:
   ```bash
   adb logcat | grep -i "error\|exception\|crash"
   ```

2. Verify API endpoints are accessible:
   ```bash
   # Test backend connection
   curl http://YOUR_BACKEND_IP:8000/api/health/
   ```

3. Update `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://YOUR_BACKEND_IP:8000',
     androidScheme: 'https'
   }
   ```

---

## CI/CD Pipeline Setup (Optional)

### GitHub Actions for Automatic Builds

Create `.github/workflows/android-build.yml`:

```yaml
name: Build Android APK

on:
  push:
    branches: [main, release/*]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 18

      - name: Set up JDK 11
        uses: actions/setup-java@v2
        with:
          java-version: 11

      - name: Build Next.js
        run: npm run build

      - name: Sync Capacitor
        run: npx cap sync android

      - name: Build APK
        run: |
          cd android
          ./gradlew assembleRelease

      - name: Upload APK
        uses: actions/upload-artifact@v2
        with:
          name: app-release.apk
          path: android/app/build/outputs/apk/release/app-release.apk
```

---

## Performance Optimization Tips

### 1. Reduce Bundle Size

```bash
# Analyze bundle
npm run build -- --analyze

# Remove unused dependencies
npm prune
```

### 2. Enable ProGuard

Edit `android/app/build.gradle`:
```gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 3. Optimize Images

- Use WebP format for images
- Compress images: `imagemin` or `squoosh`
- Use lazy loading in app

### 4. Enable Vector Drawables

Edit `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        vectorDrawables.useSupportLibrary = true
    }
}
```

---

## Testing on Android Device

### Physical Device Testing

```bash
# Enable USB Debugging on device
# Settings > Developer Options > USB Debugging

# Connect device
adb devices

# Install APK
adb install -r app-release.apk

# View logs
adb logcat
```

### Emulator Testing

```bash
# List available emulators
emulator -list-avds

# Launch emulator
emulator -avd Pixel_4_API_30

# Install APK
adb install -r app-release.apk
```

---

## Security Checklist

- ✅ Use HTTPS only for API calls
- ✅ Store sensitive data securely (use Keychain/Keystore)
- ✅ Implement JWT token refresh
- ✅ Add certificate pinning
- ✅ Obfuscate code with ProGuard
- ✅ Remove debug logging in release
- ✅ Validate all user inputs
- ✅ Use content security policy headers
- ✅ Implement rate limiting on backend
- ✅ Regular security audits

---

## Deployment Checklist

Before submitting to Play Store:

- ✅ Test on multiple devices (Android 8.0+)
- ✅ Test all features on low-end devices
- ✅ Test offline functionality
- ✅ Verify API connectivity
- ✅ Check privacy policy compliance
- ✅ Test dark mode support
- ✅ Verify all images display correctly
- ✅ Test navigation flows
- ✅ Remove all console.log statements
- ✅ Set correct API endpoints for production
- ✅ Enable ProGuard/R8 minification
- ✅ Sign APK with production key
- ✅ Test signed APK on device
- ✅ Create release notes
- ✅ Prepare screenshots and descriptions
- ✅ Set up crash monitoring
- ✅ Configure analytics tracking

---

## Monitoring & Updates

### 1. Set Up Crash Reporting

```bash
npm install @capacitor/firebase-crashlytics
```

### 2. Set Up Analytics

```bash
npm install @capacitor/firebase-analytics
```

### 3. Implement Auto-Updates

```typescript
import { App } from '@capacitor/app';

App.addListener('appStateChange', ({ isActive }) => {
  if (isActive) {
    // Check for updates
    checkForUpdates();
  }
});
```

### 4. Push Notifications

```bash
npm install @capacitor/push-notifications
```

---

## Support & Resources

- **Capacitor Documentation**: https://capacitorjs.com/docs
- **Android Development**: https://developer.android.com/
- **Google Play Console**: https://play.google.com/console
- **Android Studio**: https://developer.android.com/studio
- **Stack Overflow**: Tag with `capacitor` or `android`

---

## Summary

You now have a complete guide to build and deploy your Vaishnav Vivaah app to the Google Play Store!

**Key steps recap:**
1. ✅ Install Capacitor
2. ✅ Configure Next.js for static export
3. ✅ Add Android platform
4. ✅ Set up signing
5. ✅ Build APK/AAB
6. ✅ Upload to Play Store
7. ✅ Monitor performance

The entire process from development to Play Store release takes 2-4 weeks, with most time spent on app review and testing.

**Good luck with your Vaishnav Vivaah matrimony platform! 🙏**
