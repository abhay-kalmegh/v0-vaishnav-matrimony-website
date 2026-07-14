# Google Play Store Submission Checklist

## Pre-Submission Requirements

### Developer Account
- [ ] Google Play Developer account created ($25 one-time fee)
- [ ] Payment method verified
- [ ] Developer profile complete with name and contact

### App Credentials
- [ ] App ID: `com.vaishnav.vivaah`
- [ ] App name: "Vaishnav Vivaah"
- [ ] Signing key generated and secured
- [ ] Keystore password saved securely
- [ ] AAB (App Bundle) file built and tested

### App Information
- [ ] App title: "Vaishnav Vivaah - Sacred Matrimony"
- [ ] Short description (80 characters max)
- [ ] Full description (4000 characters)
- [ ] Category: Social / Dating
- [ ] Content rating questionnaire completed
- [ ] Privacy policy URL added
- [ ] Terms of service URL added

### Marketing Materials
- [ ] App icon: 512x512 PNG (required)
- [ ] Feature graphic: 1024x500 PNG (required)
- [ ] Screenshots (minimum 2, maximum 8):
  - [ ] Phone screenshot 1 (login/registration)
  - [ ] Phone screenshot 2 (profile)
  - [ ] Phone screenshot 3 (matches)
  - [ ] Phone screenshot 4 (messaging)
  - [ ] Phone screenshot 5 (search)
  - [ ] Tablet screenshots (if supporting tablets)
- [ ] Preview video (optional, 15-30 seconds recommended)

### App Details
- [ ] Version name: "1.0.0"
- [ ] Version code: "1"
- [ ] Minimum API level: 21 (Android 5.0)
- [ ] Target API level: 34+ (required by Google Play)
- [ ] Screen sizes: phones, tablets
- [ ] Languages: English
- [ ] Countries/regions for distribution selected

### Content Rating
- [ ] IARC rating filled
- [ ] Age group classified
- [ ] Content descriptors selected
- [ ] Ads declared (if applicable)
- [ ] User data/privacy options selected

### Permissions Justification
- [ ] Internet access - justified
- [ ] Camera access - justified (for profile photos)
- [ ] Photo library access - justified
- [ ] Location access - justified (for matching)
- [ ] Contacts access - justified (if integrated)

### Privacy & Security
- [ ] Privacy policy accessible from app
- [ ] Privacy policy compliant with GDPR
- [ ] Privacy policy compliant with CCPA (if applicable)
- [ ] Data handling practices documented
- [ ] No deceptive practices
- [ ] No spyware or malware

### Testing & QA
- [ ] APK tested on multiple devices (min 2)
- [ ] All features tested and working
- [ ] No crashes or crashes logged
- [ ] Performance verified
- [ ] Battery consumption acceptable
- [ ] Network connectivity verified
- [ ] Offline functionality tested
- [ ] Touch screen navigation works
- [ ] Device rotation handled correctly
- [ ] API endpoints verified live

### Compliance
- [ ] No prohibited content
- [ ] No hate speech or discrimination
- [ ] No sexual content (app is matrimony focused - OK)
- [ ] No violence
- [ ] No gambling
- [ ] No unauthorized modification
- [ ] HTTPS used for all API calls
- [ ] No hardcoded credentials
- [ ] Code obfuscation applied (ProGuard)
- [ ] 64-bit support verified
- [ ] Target API >= 31

## Step-by-Step Submission Process

### 1. Create Google Play Console Account
```
1. Go to https://play.google.com/apps/publish
2. Sign in with Google account (or create new)
3. Accept terms and conditions
4. Complete payment ($25 one-time)
5. Fill out account details
```

### 2. Create New App
```
1. Click "Create app"
2. Enter default language: English
3. Enter app name: "Vaishnav Vivaah"
4. Select category: Social
5. Declare it's not designed for children
```

### 3. Upload APK/AAB
```
1. Go to "Release" > "Production"
2. Click "Create new release"
3. Upload AAB file from: android/app/build/outputs/bundle/release/app-release.aab
4. Review app signing details
5. Click "Next" and review the app details
```

### 4. Fill App Details
```
App details form:
- Title: "Vaishnav Vivaah"
- Short description (shown on store)
- Full description with features
- Category: Social / Dating
- Content rating: 12+ or higher
```

### 5. Add Screenshots
```
Minimum 2 screenshots required:
1. Login/Registration screen
2. Main dashboard/matching screen
3. Profile view
4. Messaging interface

Format: PNG or JPEG, 1080x1920px (portrait)
Max size: 8 MB each
Minimum 2, Maximum 8 screenshots
```

### 6. Add Icon & Graphics
```
App Icon:
- Size: 512x512 pixels
- Format: PNG (32-bit with alpha)

Feature Graphic:
- Size: 1024x500 pixels
- Format: PNG or JPEG

Preview Video (optional):
- 15-30 seconds
- MP4 format, max 1GB
```

### 7. Content Rating Questionnaire
```
1. Go to "Pricing & distribution"
2. Complete "Content rating" questionnaire
3. Save rating
4. Application usually rated as:
   - Mild Language (if any)
   - Mild Violence: None
   - Sexual content: Mild (dating app context)
   - Alcohol/tobacco: None
   - Dating simulation: Yes (dating app)
```

### 8. Privacy Policy
```
1. Go to "App content"
2. Under "Privacy policy" paste URL:
   - Must be accessible and complete
   - Must explain data collection
   - Must be in English
   - Google recommends apps include privacy policy
```

### 9. Select Distribution
```
1. Go to "Pricing & distribution"
2. Select countries:
   - Recommended: India, USA, UK, Canada, etc.
3. Approve content rating
4. Accept Google Play policies
```

### 10. Review & Submit
```
1. Go to "Release" > "Production"
2. Review all details
3. Click "Review release"
4. Check for any blocking issues
5. Click "Submit"
6. Wait for review (typically 2-3 hours, max 24 hours)
```

## Post-Submission Monitoring

### Track Review Status
- [ ] Monitor review progress in Play Console
- [ ] Check email for status updates
- [ ] Respond to any reviewer requests within 72 hours

### If Rejected
- [ ] Read rejection reason carefully
- [ ] Address the specific issue
- [ ] Resubmit with explanation

### If Approved
- [ ] App goes live automatically
- [ ] Monitor crash reports
- [ ] Check user reviews
- [ ] Monitor rating changes
- [ ] Be ready for user support questions

## After Going Live

### Launch Activities
- [ ] Post announcement on website
- [ ] Share on social media
- [ ] Email notification to early users
- [ ] Monitor first reviews and ratings
- [ ] Track download/install metrics
- [ ] Monitor crash reports and analytics

### Ongoing Management
- [ ] Respond to user reviews
- [ ] Fix bugs within 48 hours
- [ ] Monitor crash reports daily
- [ ] Check analytics weekly
- [ ] Plan updates monthly
- [ ] Update feature graphics for promotions
- [ ] Manage ratings and reviews
- [ ] A/B test screenshots and descriptions

## Common Rejection Reasons & Solutions

### 1. "Doesn't follow Android guidelines"
- Solution: Ensure all required permissions justified
- Ensure 64-bit support
- Test on Android 12+ devices

### 2. "Crashes during testing"
- Solution: Check crash logs in Firebase Crashlytics
- Test thoroughly on multiple devices
- Check API connectivity

### 3. "Sexual content policy violation"
- Solution: Keep dating app context clear
- Ensure no explicit content in app screenshots
- Age gate appropriately

### 4. "Privacy policy issues"
- Solution: Ensure privacy policy covers all data collection
- Update privacy policy if needed
- Make policy easily accessible

### 5. "Spam or misleading content"
- Solution: Ensure honest descriptions
- Ensure features match description
- No keyword stuffing in description

## Quick Reference: Required Files

```
Project Root/
├── android/
│   ├── app/
│   │   ├── build.gradle (configured)
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── AndroidManifest.xml (configured)
│   │   │       └── java/
│   │   │           └── MainActivity.java (configured)
│   │   └── vaishnav-vivaah-key.jks (signing key)
│   └── ... (other Android files)
├── out/ (Next.js static export)
├── capacitor.config.ts (configured)
├── PLAYSTORE_SUBMISSION_CHECKLIST.md (this file)
└── App Bundle: android/app/build/outputs/bundle/release/app-release.aab
```

## Submission Timeline

| Phase | Duration | Task |
|-------|----------|------|
| Preparation | 3-5 days | Generate keystore, build APK, prepare assets |
| Testing | 2-3 days | Test on 3+ devices, verify all features |
| Asset Creation | 2-3 days | Create screenshots, icon, descriptions |
| Submission | 30 min | Upload to Play Console, fill forms |
| Review | 2-24 hours | Google Play team reviews |
| Live | Immediate | App available in Play Store |
| **Total** | **8-16 days** | From start to live |

## Support & Resources

- Google Play Console: https://play.google.com/apps/publish
- Android Development: https://developer.android.com
- Play Store Policies: https://play.google.com/about/developer-content-policy/
- Policy FAQs: https://support.google.com/googleplay/android-developer
- Appeal Decisions: https://support.google.com/googleplay/android-developer/answer/3131213

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Ready for Submission
