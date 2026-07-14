#!/bin/bash

# Generate Android Keystore for Signing
# This creates a signing key for the Google Play Store

set -e

echo "======================================"
echo "Android Keystore Generator"
echo "======================================"
echo ""
echo "This will create a signing key for Google Play Store."
echo "IMPORTANT: Save this information securely!"
echo ""

# Validate environment
if ! command -v keytool &> /dev/null; then
    echo "Error: keytool not found. Please ensure Java is installed."
    exit 1
fi

# Get user input
read -p "Enter keystore alias (e.g., vaishnav-vivaah): " ALIAS
read -sp "Enter keystore password (min 6 characters): " PASSWORD
echo ""
read -sp "Confirm keystore password: " PASSWORD_CONFIRM
echo ""

if [ "$PASSWORD" != "$PASSWORD_CONFIRM" ]; then
    echo "Error: Passwords do not match"
    exit 1
fi

if [ ${#PASSWORD} -lt 6 ]; then
    echo "Error: Password must be at least 6 characters"
    exit 1
fi

read -p "Enter your full name: " NAME
read -p "Enter your organization: " ORG
read -p "Enter your country code (e.g., IN): " COUNTRY

# Create keystore directory if it doesn't exist
mkdir -p android/app

# Generate keystore
KEYSTORE_PATH="android/app/vaishnav-vivaah-key.jks"

echo ""
echo "Generating keystore..."
keytool -genkey -v -keystore "$KEYSTORE_PATH" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10950 \
    -alias "$ALIAS" \
    -storepass "$PASSWORD" \
    -keypass "$PASSWORD" \
    -dname "CN=$NAME,O=$ORG,C=$COUNTRY"

if [ -f "$KEYSTORE_PATH" ]; then
    echo ""
    echo "Keystore created successfully!"
    echo "Location: $KEYSTORE_PATH"
    echo ""
    echo "IMPORTANT INFORMATION:"
    echo "======================"
    echo "Alias: $ALIAS"
    echo "Password: [Your password]"
    echo ""
    echo "SAVE THESE CREDENTIALS IN A SECURE LOCATION!"
    echo "You will need them for:"
    echo "1. Building releases"
    echo "2. Updating the app on Play Store"
    echo ""
    echo "Next steps:"
    echo "1. Set environment variables:"
    echo "   export KEYSTORE_PATH='$KEYSTORE_PATH'"
    echo "   export KEYSTORE_PASSWORD='$PASSWORD'"
    echo "   export KEY_ALIAS='$ALIAS'"
    echo "   export KEY_PASSWORD='$PASSWORD'"
    echo ""
    echo "2. Or create a .env file with these variables"
    echo ""
    echo "3. Run: ./scripts/build-android.sh"
else
    echo "Error: Failed to create keystore"
    exit 1
fi
