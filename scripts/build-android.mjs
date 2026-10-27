#!/usr/bin/env node
/**
 * Build the static web bundle and sync it into the Android project.
 *
 *   node scripts/build-android.mjs dev       emulator / physical-device testing (HTTP API allowed)
 *   node scripts/build-android.mjs release   store build: HTTPS API only, no dev flags
 *   add --check to validate the configuration without building
 *
 * The API URL comes from NEXT_PUBLIC_API_URL (environment or .env files) and is baked
 * into the bundle at build time, so it is validated *here*, before anything is built.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [mode, ...flags] = process.argv.slice(2);
const checkOnly = flags.includes('--check');
const root = process.cwd();

if (!['dev', 'release'].includes(mode)) {
  console.error('Usage: build-android.mjs <dev|release> [--check]');
  process.exit(2);
}

/** Minimal .env parser, honouring Next.js' precedence for production builds. */
function readEnvFiles() {
  const files = ['.env.production.local', '.env.local', '.env.production', '.env'];
  const merged = {};
  for (const f of files.reverse()) {
    const p = resolve(root, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && !line.trim().startsWith('#')) merged[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return merged;
}

const fileEnv = readEnvFiles();
const get = (k) => process.env[k] ?? fileEnv[k];
const apiUrl = get('NEXT_PUBLIC_API_URL');
const problems = [];

if (!apiUrl) problems.push('NEXT_PUBLIC_API_URL is not set (see .env.example).');
else if (!/^https?:\/\/.+/i.test(apiUrl)) problems.push('NEXT_PUBLIC_API_URL must start with http:// or https://');

if (mode === 'release') {
  if (apiUrl && !/^https:\/\//i.test(apiUrl)) problems.push('Release builds require an https:// API URL.');
  if (apiUrl && /(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.|\b10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.)/i.test(apiUrl))
    problems.push('Release builds must not point at a local/LAN development address.');
  for (const flag of ['CAP_DEV', 'NEXT_PUBLIC_ALLOW_INSECURE_API']) {
    if (get(flag) === 'true') problems.push(`${flag}=true is a development flag and must not be set for a release build.`);
  }
}

if (problems.length) {
  console.error(`\n[build-android:${mode}] configuration problems:\n` + problems.map((p) => `  - ${p}`).join('\n') + '\n');
  process.exit(1);
}

console.log(`[build-android:${mode}] API URL: ${apiUrl}`);
if (checkOnly) {
  console.log(`[build-android:${mode}] configuration OK (--check, nothing built)`);
  process.exit(0);
}

const env = { ...process.env };
if (mode === 'dev') {
  env.NEXT_PUBLIC_ALLOW_INSECURE_API = 'true';
  env.CAP_DEV = 'true';
} else {
  delete env.NEXT_PUBLIC_ALLOW_INSECURE_API;
  delete env.CAP_DEV;
}

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env, cwd: root, shell: process.platform === 'win32' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
run('npx', ['next', 'build']);
run('npx', ['cap', 'sync', 'android']);
console.log(`\n[build-android:${mode}] done. Next: ${mode === 'dev' ? 'cd android && ./gradlew assembleDebug' : 'cd android && ./gradlew bundleRelease'}`);
