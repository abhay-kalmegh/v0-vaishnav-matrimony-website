Vaishnav Vivaah - full overlay (final, verified state of every file changed by the hardening / onboarding / login work)

1. Extract at the repository root, overwriting existing files.
2. Delete the files listed in DELETE_THESE.txt (stale; not supported by the static Android export).
3. npm install --legacy-peer-deps
4. npm run verify:install      <- must print "OK - the overlay is completely installed."

It does NOT contain: .env, backend/.env, android/local.properties, android/app/src/main/assets/* (generated).
