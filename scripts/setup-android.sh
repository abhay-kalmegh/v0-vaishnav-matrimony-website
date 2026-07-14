#!/bin/bash

# Vaishnav Vivaah - Android Setup Script
# Complete setup for Android development and deployment

set -e

echo "======================================"
echo "Vaishnav Vivaah Android Setup"
echo "======================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not installed. Please install Node.js 16+${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js $NODE_VERSION found${NC}"

# Check npm
echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm not installed${NC}"
    exit 1
fi
npm_VERSION=$(npm -v)
echo -e "${GREEN}npm $npm_VERSION found${NC}"

# Check Java
echo "Checking Java..."
if ! command -v java &> /dev/null; then
    echo -e "${RED}Java not installed. Please install JDK 11+${NC}"
    echo "Download from: https://www.oracle.com/java/technologies/downloads/"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | grep "version" | awk -F '"' '{print $2}')
echo -e "${GREEN}Java $JAVA_VERSION found${NC}"

# Check Android SDK
echo "Checking Android SDK..."
if [ -z "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}ANDROID_HOME not set${NC}"
    echo "Setting ANDROID_HOME to default location..."
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        echo "macOS SDK found: $ANDROID_HOME"
    elif [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
        echo "Linux SDK found: $ANDROID_HOME"
    else
        echo -e "${RED}Android SDK not found${NC}"
        echo "Download Android Studio from: https://developer.android.com/studio"
        exit 1
    fi
else
    echo -e "${GREEN}Android SDK found: $ANDROID_HOME${NC}"
fi

# Install dependencies
echo ""
echo "Installing npm dependencies..."
npm install

# Check if Capacitor is installed
echo ""
echo "Checking Capacitor..."
if [ ! -d "node_modules/@capacitor" ]; then
    echo "Installing Capacitor..."
    npm install @capacitor/core @capacitor/cli @capacitor/android
    echo -e "${GREEN}Capacitor installed${NC}"
else
    echo -e "${GREEN}Capacitor already installed${NC}"
fi

# Create Android platform
echo ""
echo "Setting up Android platform..."
if [ ! -d "android" ]; then
    echo "Adding Android platform..."
    npx cap add android
    echo -e "${GREEN}Android platform added${NC}"
else
    echo -e "${GREEN}Android platform already exists${NC}"
fi

# Create environment file
echo ""
echo "Creating .env file for keystore..."
if [ ! -f ".env.android" ]; then
    cat > .env.android << 'EOF'
# Android Keystore Configuration
# Set these values after running: ./scripts/generate-keystore.sh

KEYSTORE_PATH=android/app/vaishnav-vivaah-key.jks
KEYSTORE_PASSWORD=your_keystore_password
KEY_ALIAS=vaishnav-vivaah
KEY_PASSWORD=your_key_password
EOF
    echo -e "${GREEN}.env.android created${NC}"
    echo "Please edit .env.android with your keystore credentials"
else
    echo -e "${GREEN}.env.android already exists${NC}"
fi

# Make scripts executable
echo ""
echo "Making scripts executable..."
chmod +x scripts/build-android.sh
chmod +x scripts/generate-keystore.sh
chmod +x scripts/setup-android.sh

echo ""
echo -e "${GREEN}======================================"
echo "Setup Complete!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo "1. Generate signing key: ./scripts/generate-keystore.sh"
echo "2. Edit .env.android with your credentials"
echo "3. Build Android app: ./scripts/build-android.sh"
echo ""
echo "Documentation: ANDROID_DEPLOYMENT.md"
