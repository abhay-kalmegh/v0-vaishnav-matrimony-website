#!/bin/bash

# Vaishnav Vivaah - Android Build Script
# This script builds a production-ready APK/AAB for Google Play Store

set -e

echo "======================================"
echo "Vaishnav Vivaah Android Build Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed${NC}"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo -e "${RED}Java is not installed${NC}"
    exit 1
fi

if [ ! -d "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}Warning: ANDROID_HOME not set. Please ensure Android SDK is installed.${NC}"
fi

echo -e "${GREEN}Prerequisites check passed${NC}"
echo ""

# Step 1: Build Next.js for static export
echo "Step 1/5: Building Next.js application..."
npm run build
if [ ! -d "out" ]; then
    echo -e "${RED}Next.js build failed - 'out' directory not created${NC}"
    exit 1
fi
echo -e "${GREEN}Next.js build successful${NC}"
echo ""

# Step 2: Install Capacitor if not already installed
echo "Step 2/5: Checking Capacitor installation..."
if [ ! -d "node_modules/@capacitor" ]; then
    echo "Installing Capacitor..."
    npm install @capacitor/core @capacitor/cli @capacitor/android
fi
echo -e "${GREEN}Capacitor ready${NC}"
echo ""

# Step 3: Add/update Android platform
echo "Step 3/5: Preparing Android platform..."
if [ ! -d "android" ]; then
    echo "Creating Capacitor Android platform..."
    npx cap add android
else
    echo "Updating Capacitor Android platform..."
    npx cap update android
fi
echo -e "${GREEN}Android platform ready${NC}"
echo ""

# Step 4: Sync web assets
echo "Step 4/5: Syncing web assets to Android..."
npx cap sync android
echo -e "${GREEN}Web assets synced${NC}"
echo ""

# Step 5: Build APK/AAB
echo "Step 5/5: Building Android application..."
echo ""
echo "Select build type:"
echo "1) Debug APK (for testing)"
echo "2) Release APK (for Play Store manual upload)"
echo "3) App Bundle AAB (recommended for Play Store)"
echo ""
read -p "Enter your choice (1-3): " build_choice

case $build_choice in
    1)
        echo "Building Debug APK..."
        cd android
        ./gradlew assembleDebug
        cd ..
        APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
        if [ -f "$APK_PATH" ]; then
            echo -e "${GREEN}Debug APK built successfully!${NC}"
            echo "Location: $APK_PATH"
        else
            echo -e "${RED}Debug APK build failed${NC}"
            exit 1
        fi
        ;;
    2)
        echo "Building Release APK..."
        if [ ! -f "android/app/vaishnav-vivaah-key.jks" ]; then
            echo -e "${RED}Keystore file not found at android/app/vaishnav-vivaah-key.jks${NC}"
            echo "Please run: ./scripts/generate-keystore.sh"
            exit 1
        fi
        cd android
        ./gradlew assembleRelease
        cd ..
        APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
        if [ -f "$APK_PATH" ]; then
            echo -e "${GREEN}Release APK built successfully!${NC}"
            echo "Location: $APK_PATH"
        else
            echo -e "${RED}Release APK build failed${NC}"
            exit 1
        fi
        ;;
    3)
        echo "Building App Bundle (AAB)..."
        if [ ! -f "android/app/vaishnav-vivaah-key.jks" ]; then
            echo -e "${RED}Keystore file not found at android/app/vaishnav-vivaah-key.jks${NC}"
            echo "Please run: ./scripts/generate-keystore.sh"
            exit 1
        fi
        cd android
        ./gradlew bundleRelease
        cd ..
        AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"
        if [ -f "$AAB_PATH" ]; then
            echo -e "${GREEN}App Bundle built successfully!${NC}"
            echo "Location: $AAB_PATH"
        else
            echo -e "${RED}App Bundle build failed${NC}"
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}======================================"
echo "Build Complete!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo "1. Test the APK on a physical device or emulator"
echo "2. If ready for Play Store, upload the AAB to Google Play Console"
echo "3. Follow the review process (typically 2-3 hours)"
echo ""
echo "For help, refer to: ANDROID_DEPLOYMENT.md"
