#!/usr/bin/env node
/**
 * npm run verify:install
 * Confirms the hardening/onboarding/login overlay is completely and consistently installed:
 *  - every "@/..." and relative import in the app resolves to a real file (catches a partly-copied update)
 *  - the files the new code depends on exist, and stale ones are gone
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();
const problems = [];
const ok = [];

const REQUIRED = [
  'lib/registration.ts', 'lib/api.ts', 'lib/api/auth.ts', 'lib/api/profiles.ts', 'lib/api/interests.ts',
  'lib/api/messaging.ts', 'lib/api/events.ts', 'lib/api/matches.ts', 'lib/context/auth-context.tsx',
  'lib/components/protected-route.tsx', 'app/login/page.tsx', 'app/register/page.tsx',
  'eslint.config.mjs', 'vitest.config.ts', 'scripts/build-android.mjs',
  'backend/apps/profiles/completion.py', 'backend/apps/accounts/health.py',
  'backend/tests/test_auth.py', 'tests/login-flow.test.tsx',
];
const MUST_NOT_EXIST = ['middleware.ts', 'proxy.ts'];
const MARKERS = [ // [file, text that only the new version contains]
  ['lib/api.ts', 'describeError'],
  ['lib/context/auth-context.tsx', 'parseAuthResponse'],
  ['app/login/page.tsx', 'result.nextRoute'],
  ['backend/config/settings.py', 'OTP_MAX_ATTEMPTS'],
  ['backend/apps/accounts/serializers.py', 'missing_profile_fields'],
];

for (const f of REQUIRED) (existsSync(join(root, f)) ? ok : problems).push(existsSync(join(root, f)) ? f : `MISSING FILE: ${f}`);
for (const f of MUST_NOT_EXIST) if (existsSync(join(root, f))) problems.push(`STALE FILE (delete it - not supported by the static Android export): ${f}`);
for (const [f, needle] of MARKERS) {
  const p = join(root, f);
  if (!existsSync(p)) continue; // already reported (or not part of this checkout)
  if (!readFileSync(p, 'utf8').includes(needle)) problems.push(`OLD VERSION of ${f} (expected it to contain "${needle}")`);
}

// import resolution
const EXT = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '/index.ts', '/index.tsx', '/index.js'];
const exists = (base) => EXT.some((e) => existsSync(base + e) && (e !== '' || statSync(base).isFile()));
function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (['node_modules', '.next', 'out', 'android', 'backend', '.git', 'coverage'].includes(n)) continue;
    const p = join(dir, n);
    statSync(p).isDirectory() ? walk(p, out) : /\.(tsx?|mjs)$/.test(n) && !n.endsWith('.d.ts') && out.push(p);
  }
  return out;
}
let imports = 0;
for (const file of walk(root)) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/(?:from|import)\s*\(?\s*['"]((?:@\/|\.{1,2}\/)[^'"]+)['"]/g)) {
    imports += 1;
    const spec = m[1];
    const target = spec.startsWith('@/') ? resolve(root, spec.slice(2)) : resolve(dirname(file), spec);
    if (!exists(target)) problems.push(`BROKEN IMPORT in ${file.slice(root.length + 1)}: ${spec}`);
  }
}

console.log(`checked ${REQUIRED.length} required files, ${MARKERS.length} version markers and ${imports} imports`);
if (problems.length) {
  console.error('\nINSTALL INCOMPLETE:\n' + problems.map((p) => `  - ${p}`).join('\n'));
  console.error('\nExtract vv-full-overlay.zip over the project again (see OVERLAY_README.txt), delete the stale files, then re-run.');
  process.exit(1);
}
console.log('OK - the overlay is completely installed.');
