"""Settings for the automated test-suite (``python manage.py test --settings=config.test_settings``)."""

import os

os.environ.setdefault("SECRET_KEY", "test-only-secret-key-" + "x" * 24)
os.environ.setdefault("DEBUG", "True")
os.environ.setdefault("THROTTLE_OTP_SEND", "10000/hour")
os.environ.setdefault("THROTTLE_OTP_VERIFY", "10000/hour")
os.environ.setdefault("THROTTLE_ANON", "100000/hour")
os.environ.setdefault("THROTTLE_USER", "100000/hour")

from .settings import *  # noqa: E402,F401,F403

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]  # fast hashing for tests
MEDIA_ROOT = "/tmp/vv_test_media"
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}

LOGGING["root"]["level"] = "CRITICAL"  # noqa: F405 - keep expected 4xx warnings out of test output
LOGGING["loggers"]["django.request"] = {"handlers": [], "level": "CRITICAL", "propagate": False}  # noqa: F405
LOGGING["loggers"]["django.security"]["level"] = "CRITICAL"  # noqa: F405
