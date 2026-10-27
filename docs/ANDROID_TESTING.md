# Android testing guide (verified commands)

This is the current, tested procedure. Older `docs/ANDROID_*` files may be out of date.

**Architecture:** the Android app is the static Next.js site (`out/`) inside a Capacitor WebView.
API calls go through `CapacitorHttp` (native HTTP) to Django. There is no Retrofit layer.

## 0. One-time setup
| Need | Notes |
|---|---|
| Node 20+ / 22 | `node -v` |
| Python 3.12 + PostgreSQL 14+ | for the backend |
| Android Studio (Hedgehog+) | installs the SDK, a JDK 17 and the emulator |
| JDK 17 | Gradle for Capacitor 6 needs 17 (Android Studio bundles it) |

```bash
# backend
cd backend && python -m venv .venv && . .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # then edit: DEBUG=True, SECRET_KEY, DATABASE_URL, ALLOWED_HOSTS=*, CORS_ALLOWED_ORIGINS=https://localhost
python manage.py migrate
python manage.py seed_sampradays
python manage.py createsuperuser        # admin account, to approve profiles

# frontend
cd .. && npm install --legacy-peer-deps
cp .env.example .env
```

## 1. Run the backend (must listen on all interfaces)
```bash
cd backend && python manage.py runserver 0.0.0.0:8000
```
Windows: allow Python through the firewall on *private* networks when prompted.

## 2. Point the app at it
Edit `.env` (the URL is baked into the bundle, so **rebuild after every change**):

| Target | `NEXT_PUBLIC_API_URL` |
|---|---|
| Emulator | `http://10.0.2.2:8000/api` |
| Physical phone (same Wi-Fi) | `http://<computer-LAN-IP>:8000/api` (`ipconfig` / `ifconfig`) |

Also add the LAN IP to `ALLOWED_HOSTS` in `backend/.env` if `DEBUG=False`.

## 3. Build and sync
```bash
npm run build:android          # validates config, `next build`, `cap sync android`
```
(Uses dev flags: HTTP API allowed. `npm run build:android:release` refuses HTTP/LAN URLs.)

## 4. Build the debug APK
```bash
cd android
./gradlew assembleDebug        # Windows: gradlew.bat assembleDebug
# -> android/app/build/outputs/apk/debug/app-debug.apk
```
Sanity-check from your browser first: `http://<url>/api/health/` should return `{"status":"ok"}`.

## 5. Install and run
```bash
# Emulator: create one in Android Studio > Device Manager, start it, then
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.vaishnav.vivaah/.MainActivity

# Physical phone: enable Developer options + USB debugging, plug in, `adb devices`, then the same adb install
# Watch logs:
adb logcat | grep -iE "capacitor|chromium|vaishnav"        # Windows: adb logcat | findstr /i "capacitor chromium"
# WebView console/network: open chrome://inspect on the desktop with the phone connected
```
With `DEBUG=True`, the OTP is returned by `send-otp` and also printed in the Django console; type it in.

## 6. Manual test script (tick each on a device)
1. Register: phone -> OTP -> six wizard steps; kill the app mid-way, reopen, log in -> resumes at the first unfinished step.
2. Log in as an existing user; confirm `/dashboard` loads (no bounce to the wizard once complete).
3. Admin: Django admin -> Profiles -> tick **Is approved** for two test profiles (members cannot approve themselves).
4. Search with age/city/gender/sampraday filters; open a profile; confirm no phone/email is shown.
5. Send interest, shortlist; second account accepts; chat both ways; switch accounts and confirm bubbles are on the correct sides.
6. Events list + register. Settings. Log out -> back button must not reveal data; log in as someone else.
7. Airplane mode: every screen should show a readable error, not a blank page.
8. Rotate the screen, background/foreground the app, wait 60+ min (access token expiry) and confirm silent refresh.

## 7. Known device-only unknowns (not verifiable without hardware)
* `CapacitorHttp` + `FormData` (multipart) uploads: the API supports photo upload but **the UI currently has no photo uploader**; verify when one is added.
* Back-button / deep link (`https://vaishnav-vivaah.app`, placeholder domain with no asset links) behaviour.
* Keyboard overlap on the long wizard forms; safe-area insets.
* Release-build behaviour (minification is off; see PRODUCTION_CHECKLIST).

## Troubleshooting
| Symptom | Cause / fix |
|---|---|
| "Cannot reach the server" | wrong IP, server bound to 127.0.0.1 only, firewall, or phone on a different network |
| CLEARTEXT not permitted | you built a *release* variant, or `src/debug/.../network_security_config.xml` was removed |
| 400 "Invalid host header" | add the IP to `ALLOWED_HOSTS` |
| App shows the old API URL | you changed `.env` but did not re-run `npm run build:android` |
| `cap sync` complains about CLI version | `npm ls @capacitor/cli` must be 6.x |
