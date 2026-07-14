# Vaishnav Vivaah - iOS IPA/App Store Deployment Guide

## Overview

This guide explains how to build a production-ready iOS IPA (iOS Application Archive) or upload to the Apple App Store from your existing Next.js web application using **Capacitor**.

iOS deployment requires:
- ✅ Mac with macOS (10.15+)
- ✅ Xcode
- ✅ Apple Developer Account
- ✅ Apple Developer Program membership

---

## Prerequisites

### 1. System Requirements

- **macOS 10.15 (Catalina) or later**
  ```bash
  sw_vers
  # ProductName: macOS
  # ProductVersion: 13.0 or higher
  ```

- **Xcode 13.0 or later**
  ```bash
  xcode-select --install
  xcode-select --version
  ```

- **CocoaPods** (iOS package manager)
  ```bash
  sudo gem install cocoapods
  pod --version
  ```

- **Node.js & npm/pnpm**
  ```bash
  node -v  # Should be v18+
  npm -v
  ```

### 2. Apple Developer Account

1. Enroll in Apple Developer Program: https://developer.apple.com/programs/
   - Annual membership: $99/year
   - Access to TestFlight, App Store, development certificates

2. Create App ID in Developer Account:
   - Go to https://developer.apple.com/account/
   - Create new identifier: `com.vaishnav.vivaah`

3. Create provisioning profiles:
   - Development profile (for testing)
   - Distribution profile (for App Store)

### 3. Environment Setup

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify installation
xcode-select -p
# Should output: /Applications/Xcode.app/Contents/Developer

# Install CocoaPods
sudo gem install cocoapods

# Accept Xcode license
sudo xcode-select --reset
sudo xcode-build-license accept
```

---

## Step 1: Verify Capacitor Setup

Ensure Capacitor is already installed from Android setup:

```bash
cd /vercel/share/v0-project

# Check Capacitor installation
npm list @capacitor/core @capacitor/cli

# Install if missing
npm install @capacitor/core @capacitor/cli @capacitor/ios
```

---

## Step 2: Verify Next.js Build

```bash
# Build Next.js
npm run build

# Verify output
ls -la out/
# Should show index.html and static assets
```

---

## Step 3: Add iOS Platform

```bash
npx cap add ios
```

This creates an `ios/` directory with an Xcode project:

```
ios/
├── App
│   ├── App.xcodeproj
│   ├── Pods
│   ├── App.xcworkspace
│   └── App (source code)
├── Podfile
└── Podfile.lock
```

---

## Step 4: Sync Web Assets

```bash
npx cap sync ios
```

This:
- Copies web assets to `ios/App/App/`
- Installs CocoaPods dependencies
- Updates Xcode project

---

## Step 5: Configure iOS App

### 5.1 Open Xcode Project

```bash
cd ios/App
open App.xcworkspace  # Use .xcworkspace, NOT .xcodeproj
```

### 5.2 Configure App Settings

In Xcode, select target "App":

**General Tab:**
- Product Name: Vaishnav Vivaah
- Bundle Identifier: com.vaishnav.vivaah
- Minimum Deployments: 13.0
- Device Orientation: Portrait & Landscape

**Signing & Capabilities Tab:**
- Team: Select your Apple Developer team
- Automatically manage signing: ✓ (checked)

### 5.3 Update Info.plist

Edit `ios/App/App/Info.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    
    <key>CFBundleDisplayName</key>
    <string>Vaishnav Vivaah</string>
    
    <key>CFBundleIdentifier</key>
    <string>com.vaishnav.vivaah</string>
    
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    
    <key>CFBundleName</key>
    <string>Vaishnav Vivaah</string>
    
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    
    <key>CFBundleVersion</key>
    <string>1</string>
    
    <key>LSRequiresIPhoneOS</key>
    <true/>
    
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    
    <key>UIMainStoryboardFile</key>
    <string>Main</string>
    
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
        <key>NSAllowsArbitraryLoadsForMedia</key>
        <true/>
        <key>NSAllowsArbitraryLoadsInWebContent</key>
        <true/>
    </dict>
    
    <key>NSCameraUsageDescription</key>
    <string>We need camera access to upload profile photos</string>
    
    <key>NSPhotoLibraryUsageDescription</key>
    <string>We need access to your photos to upload profile pictures</string>
    
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>We need your location to show matches near you</string>
</dict>
</plist>
```

---

## Step 6: Configure Signing Certificates

### 6.1 Create Signing Certificates in Apple Developer Account

1. Go to https://developer.apple.com/account/resources/
2. Select "Certificates, Identifiers & Profiles"
3. Create certificates:
   - iOS App Development (for testing)
   - iOS Distribution (for App Store)

### 6.2 Download Certificates to Keychain

```bash
# Certificates auto-import to Keychain
# Verify in Keychain Access app
open /Applications/Utilities/Keychain\ Access.app

# Look for:
# - "iPhone Developer" certificate
# - "iPhone Distribution" certificate
```

### 6.3 Configure Xcode Team

In Xcode:
1. Select target "App"
2. Go to "Signing & Capabilities"
3. Team: Select your Apple Developer team
4. Check "Automatically manage signing"

---

## Step 7: Add App Icons

### 7.1 Generate Icons

Use https://appicon.co/ or similar tool to generate iOS app icons.

Sizes needed:
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 120x120 (iPhone)
- 87x87 (iPhone)
- 80x80 (iPhone)
- 40x40 (iPhone)
- 29x29 (iPhone)

### 7.2 Add Icons to Xcode

In Xcode:
1. Select "Assets.xcassets"
2. Right-click "AppIcon"
3. Import icons for each size
4. Verify all slots are filled

---

## Step 8: Build for Testing (Debug)

### 8.1 Build with Xcode

```bash
cd ios/App
xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 14'
```

Or use Xcode GUI:
1. Select iPhone 14 simulator (or device)
2. Click Product > Build
3. Click Product > Run

### 8.2 Test on Physical Device

```bash
# Connect iPhone via USB
# Trust device when prompted
# Select device in Xcode
# Click Product > Run
```

---

## Step 9: Build for Release (Production)

### 9.1 Update Version Numbers

In Xcode, select target "App":
- Version: 1.0
- Build: 1

### 9.2 Build Archive

In Xcode:
1. Select "Any iOS Device (arm64)" (not simulator!)
2. Product > Archive
3. Wait for build to complete

### 9.3 Export IPA

After successful archive:
1. "Distribute App" dialog appears
2. Select "App Store Connect"
3. Select "Upload"
4. Select signing certificate
5. Complete export

IPA file location:
```
~/Library/Developer/Xcode/Archives/[timestamp]/App.xcarchive/Products/Applications/App.app
```

---

## Step 10: App Store Connect Setup

### 10.1 Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com/
2. Click "My Apps"
3. Click "+" > "New App"

Fill in:
- **Platform**: iOS
- **Name**: Vaishnav Vivaah
- **Primary Language**: English
- **Bundle ID**: com.vaishnav.vivaah
- **SKU**: vaishnav-vivaah (unique identifier)
- **User Access**: Full Access

### 10.2 Configure App Information

**App Information:**
- Category: Lifestyle
- Content Rating: Ask users to rate, or select rating
- Privacy Policy: https://yoursite.com/privacy

**Pricing and Availability:**
- Price Tier: Free
- Availability: Select countries
- Release Date: Automatic (releases when approved)

### 10.3 Add App Description

- **Name**: Vaishnav Vivaah
- **Subtitle**: Sacred Matrimony Platform
- **Description**: 
  ```
  Vaishnav Vivaah is a sacred matrimony platform exclusively 
  designed for Krishna devotees and members of Vaishnav Sampraday.
  
  Features:
  - Profile Creation & Management
  - Spiritual Compatibility Matching
  - Advanced Search & Filtering
  - Real-time Messaging
  - Event Registration
  - Success Stories
  ```
- **Keywords**: marriage, matrimony, vaishnav, krishna, devotee
- **Support URL**: https://yoursite.com/contact
- **Privacy Policy**: https://yoursite.com/privacy

### 10.4 Add Screenshots

Add screenshots for:
- iPhone 6.7-inch (Super Retina XDR) - at least 2 screenshots
- iPhone 5.5-inch (optional)
- iPad 12.9-inch (optional)

Recommended:
1. Hero screenshot (main feature)
2. Profile screen
3. Matching screen
4. Messaging screen
5. Settings screen

Size: 1242x2208 pixels (PNG or JPEG)

### 10.5 Add App Preview (Optional)

Create 15-30 second video showing app features:
- 1242x2208 pixels, 30fps
- MP4 format
- No audio required

---

## Step 11: Upload to App Store Connect

### 11.1 Upload via Xcode

In Xcode, after archive:
1. Select archive
2. Click "Distribute App"
3. Select "App Store Connect"
4. Select "Upload"
5. Review and upload

### 11.2 Verify Upload

```bash
# In App Store Connect
# Go to TestFlight > Builds
# New build should appear within 5-10 minutes
```

---

## Step 12: Beta Testing with TestFlight

### 12.1 Add Internal Testers

In App Store Connect:
1. Go to TestFlight > Internal Testing
2. Add testers (Apple ID emails)
3. Send invites

### 12.2 Invite External Testers

1. Go to External Testing
2. Create beta group
3. Add up to 10,000 testers
4. Testers download TestFlight app
5. Enter beta code to install

### 12.3 Gather Feedback

- Monitor crash reports
- Read tester feedback
- Fix issues before submission

---

## Step 13: Submit for App Store Review

### 13.1 Complete App Review Information

In App Store Connect:
1. Go to App > App Review Information
2. Contact information: Your email
3. Notes for reviewers: 
   ```
   This is a matrimony platform for Vaishnav devotees.
   Test credentials:
   - Email: test@example.com
   - Password: TestPassword123!
   ```

### 13.2 Check Guidelines Compliance

Verify your app meets Apple guidelines:
- ✅ No crashes on startup
- ✅ Content matches description
- ✅ No ads or external purchases not disclosed
- ✅ Proper permissions requested
- ✅ Privacy policy provided
- ✅ COPPA compliant (if under 13)

### 13.3 Submit for Review

1. Go to "Version Information"
2. Check "Ready to Submit for Review"
3. Click "Submit for Review"
4. Answer questions about content

**Typical Review Time**: 24-48 hours

---

## Step 14: Monitor Review Status

### 14.1 Check Review Status

In App Store Connect:
1. Go to "Version Information"
2. View "Status" column
3. Possible statuses:
   - `Waiting for Review` (2-4 hours)
   - `In Review` (24-48 hours)
   - `Ready for Sale` (approved!)
   - `Rejected` (fix issues and resubmit)

### 14.2 Handle Rejections

If rejected:
1. Read rejection reason
2. Make required changes
3. Test thoroughly
4. Resubmit

Common rejection reasons:
- Crashes on startup
- Doesn't match description
- Missing privacy policy
- Inappropriate content
- Uses private APIs

---

## Step 15: Post-Launch Monitoring

### 15.1 Monitor Crashes

In Xcode:
```bash
# Download crash logs
xcodebuild -exportNotarizedApp \
  -archivePath ~/path/to/app.xcarchive \
  -exportPath ~/path/to/export
```

### 15.2 Monitor Analytics

In App Store Connect:
- Performance metrics
- Crash rates
- User retention
- Ratings and reviews

### 15.3 Handle Updates

To submit an update:
1. Increment version number
2. Make changes to code
3. Build new archive
4. Upload to App Store Connect
5. Submit for review
6. Monitor review status

---

## Troubleshooting

### Problem: "No Matching Provisioning Profile Found"

**Solution:**
1. Open Keychain Access
2. Verify certificates are present
3. In Xcode: Product > Clean Build Folder
4. Try again: Product > Build

### Problem: "Failed to Build - Missing iOS Deployment Target"

**Solution:**
Edit `ios/App/Podfile`:
```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
    target.build_configurations.each do |config|
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= [
        '$(inherited)',
        'PERMISSION_CAMERA=1',
        'PERMISSION_PHOTOS=1',
        'PERMISSION_LOCATION=1',
      ]
    end
  end
end
```

Run:
```bash
cd ios/App
pod install
```

### Problem: "Certificate Expired"

**Solution:**
1. Generate new certificate in Apple Developer Account
2. Download to Keychain
3. In Xcode: Select Team again
4. Rebuild

### Problem: "Archive Failed - Code Signing Required"

**Solution:**
1. In Xcode: Signing & Capabilities
2. Team: Select your team
3. Check "Automatically manage signing"
4. Clear build folder: Product > Clean Build Folder
5. Try again

### Problem: "App Crashes on Launch"

**Solution:**
1. Review Console.app for crash logs
2. Check Info.plist for required keys
3. Verify API endpoints are HTTPS
4. Enable NSAppTransportSecurity if needed

---

## Performance Optimization

### 1. Reduce App Size

```bash
# Analyze app size
cd ios/App
xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath app.xcarchive analyze
```

### 2. Enable App Thinning

In Xcode Build Settings:
- Asset Catalog: Compression: Lossy
- Strip Swift Symbols: Yes
- Dead Code Stripping: Yes

### 3. Optimize Images

- Use HEIC format for images
- Compress before including
- Use Xcode asset catalog

### 4. Lazy Load Resources

```typescript
// In your React component
const LazyComponent = lazy(() => import('./Component'));

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyComponent />
    </Suspense>
  );
}
```

---

## Security Checklist

- ✅ Use HTTPS only
- ✅ Implement certificate pinning
- ✅ Store sensitive data in Keychain
- ✅ Validate all user inputs
- ✅ Use secure random number generation
- ✅ Implement app-specific passcode
- ✅ Encrypt stored data
- ✅ Remove debug symbols in release
- ✅ Enable App Transport Security
- ✅ Regular security audits

---

## Deployment Checklist

Before submitting to App Store:

- ✅ Test on iPhone 13 and iPhone 14
- ✅ Test on iOS 13, 14, and latest
- ✅ Verify all features work
- ✅ Test offline functionality
- ✅ Verify API connectivity
- ✅ Check privacy policy compliance
- ✅ Test dark mode
- ✅ Verify all images display correctly
- ✅ Test navigation flows
- ✅ Remove all debug console logs
- ✅ Set correct API endpoints
- ✅ Enable code optimization
- ✅ Test signed build on device
- ✅ Create compelling screenshots
- ✅ Write clear description
- ✅ Set up crash monitoring
- ✅ Configure analytics

---

## Support & Resources

- **Capacitor iOS Guide**: https://capacitorjs.com/docs/ios
- **Apple Developer**: https://developer.apple.com/
- **App Store Connect**: https://appstoreconnect.apple.com/
- **Xcode**: https://developer.apple.com/xcode/
- **TestFlight**: https://developer.apple.com/testflight/

---

## Summary

You now have a complete guide to build and deploy your Vaishnav Vivaah app to the Apple App Store!

**Key steps recap:**
1. ✅ Install Xcode and CocoaPods
2. ✅ Add iOS platform with Capacitor
3. ✅ Configure app in Xcode
4. ✅ Generate and manage certificates
5. ✅ Build and test on device
6. ✅ Create app in App Store Connect
7. ✅ Upload to App Store
8. ✅ Monitor review status
9. ✅ Handle updates

**Timeline**: 2-4 weeks total, with most time spent on App Store review and testing.

**Good luck with your iOS release! 🙏**
