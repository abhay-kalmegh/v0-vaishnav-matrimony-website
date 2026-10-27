# Production readiness checklist

Status legend: **DONE** = implemented and covered by tests, **TODO** = needs your decision/credentials, **VERIFY** = needs a device/server.

## Environment variables (backend) - set in your host's secret manager, never in git
| Variable | Required | Notes |
|---|---|---|
| `SECRET_KEY` | yes | >= 32 random chars; the app refuses to boot without it when `DEBUG=False` |
| `DEBUG` | yes | must be `False` |
| `ALLOWED_HOSTS` | yes | the API hostname(s); no wildcard default in production |
| `DATABASE_URL` | yes | `postgres://user:pass@host:5432/db` (use a least-privilege DB user) |
| `CORS_ALLOWED_ORIGINS` | yes | include `https://localhost` (Capacitor Android) and your web origin |
| `CSRF_TRUSTED_ORIGINS` | yes | `https://<api-domain>` |
| `BEHIND_HTTPS_PROXY` | if behind nginx/ALB | `true` (prevents SSL-redirect loops) |
| `ADMIN_URL` | recommended | non-default admin path, e.g. `manage-7f3k2/` |
| `CELERY_BROKER_URL` / `CELERY_RESULT_BACKEND` | if using Celery | Redis URL |
| SMS gateway key(s) | yes (TODO) | no OTP delivery exists yet - see below |

Frontend/Android build: `NEXT_PUBLIC_API_URL=https://<api-domain>/api` (checked by `npm run build:android:release`).
Signing (never commit): `KEYSTORE_PATH`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.

## Blockers before any public launch
1. **TODO - SMS delivery.** `SendOTPView` only creates the code. With `DEBUG=False` nothing is sent, so nobody can log in. Integrate an SMS provider (MSG91/Twilio) in `apps/accounts/views.py` (marked `TODO(production)`).
2. **TODO - Payments.** `/subscriptions/subscribe/` now refuses paid plans (HTTP 501) because no gateway verifies payment. Implement create-order + signed webhook verification before enabling.
3. **TODO - Media storage.** Uploaded photos are saved to local disk and only served when `DEBUG=True`. Use S3/GCS (django-storages) or nginx `alias`, and serve private/matches-only photos through an authenticated URL.
4. **TODO - Profile approval workflow.** Search and contact require `is_approved=True`, set only by staff in Django admin. Decide who reviews and how fast; add an admin queue/notification.
5. **TODO - Rotate anything that was ever committed.** `.env`, `backend/.env` and `android/local.properties` were tracked in git history (values looked like dev placeholders, but treat as exposed): rotate `SECRET_KEY` and any DB password that is reused anywhere. History was NOT rewritten (needs your approval; `git filter-repo` + force-push).
6. **TODO - Legal/app-store:** privacy policy, terms of service, **account & data deletion** (Play Store requires an in-app path and a web URL), data-safety form. No deletion endpoint exists yet.
7. **TODO - Release signing & identity:** confirm `applicationId com.vaishnav.vivaah`, create the upload keystore, `versionCode/versionName`. The deep-link host `vaishnav-vivaah.app` in the manifest is a placeholder: remove it or publish `assetlinks.json`.

## Backend
- DONE: migrations for all apps (+ backfill), tested on PostgreSQL 16; `SECRET_KEY`/`ALLOWED_HOSTS` enforcement; API docs only when `DEBUG`; configurable admin path; HTTPS redirect, HSTS, secure cookies when not DEBUG; `/api/health/`; throttling; OTP attempt/cooldown/hourly limits; logout revokes refresh tokens; per-user data isolation tests.
- TODO: run `python manage.py check --deploy` on the real server; gunicorn/uvicorn behind nginx (`gunicorn config.wsgi`); `collectstatic` + WhiteNoise or nginx for admin static files; DB backups + restore drill; log shipping/alerts (Sentry); uptime monitor on `/api/health/`; Celery worker if tasks are used.
- TODO (privacy decision): contact details are never shown to other members. If you want them revealed after a mutual match, add it deliberately.

## Frontend / Android
- DONE: static export, Capacitor 6 aligned, release/dev build guard, HTTPS-only release network policy, permissions reduced to INTERNET, backups disabled, no secrets in the bundle (tested).
- VERIFY on device: everything in `docs/ANDROID_TESTING.md` section 6/7.
- TODO: `minifyEnabled` is `false`; enable R8 + test a release build once a device is available. Add crash reporting. Replace placeholder deep link. Add accessibility pass (labels exist on the new registration controls; other screens not audited).
