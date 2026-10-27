import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');

describe('static export & Capacitor', () => {
  it('next.config exports a static site into ./out, which Capacitor serves', () => {
    expect(read('next.config.mjs')).toMatch(/output:\s*'export'/);
    expect(read('capacitor.config.ts')).toMatch(/webDir:\s*'out'/);
  });
  it('middleware / proxy files (unsupported by static export) are not present', () => {
    // Next 15 calls it middleware.ts, Next 16 renamed it proxy.ts; neither can run in an exported app.
    for (const f of ['middleware.ts', 'proxy.ts']) expect(() => readFileSync(join(root, f)), f).toThrow();
  });
  it('Capacitor core, CLI and Android share a major version', () => {
    const deps = JSON.parse(read('package.json')).dependencies;
    const dev = JSON.parse(read('package.json')).devDependencies ?? {};
    const major = (v: string) => v.replace(/^[^\d]*/, '').split('.')[0];
    const all = { ...deps, ...dev };
    const set = new Set(['@capacitor/core', '@capacitor/cli', '@capacitor/android', '@capacitor/preferences'].map((k) => major(all[k])));
    expect(set.size).toBe(1);
  });
  it('mixed content / cleartext are only enabled by the explicit dev flag', () => {
    const cfg = read('capacitor.config.ts');
    expect(cfg).toMatch(/allowMixedContent:\s*process\.env\.CAP_DEV === 'true'/);
    expect(cfg).toMatch(/cleartext:\s*process\.env\.CAP_DEV === 'true'/);
    expect(cfg).toMatch(/CapacitorHttp:\s*\{\s*enabled:\s*true/);
  });
  it('only plugins that are installed are configured', () => {
    const cfg = read('capacitor.config.ts');
    for (const unused of ['PushNotifications', 'LocalNotifications', 'SplashScreen']) expect(cfg).not.toContain(unused);
  });
});

describe('Android manifest & network policy', () => {
  const manifest = read('android/app/src/main/AndroidManifest.xml');
  it('requests only the INTERNET permission', () => {
    const perms = [...manifest.matchAll(/uses-permission android:name="([^"]+)"/g)].map((m) => m[1]);
    expect(perms).toEqual(['android.permission.INTERNET']);
  });
  it('keeps tokens out of backups and forbids cleartext by default', () => {
    expect(manifest).toContain('android:allowBackup="false"');
    expect(manifest).toContain('android:usesCleartextTraffic="false"');
    expect(read('android/app/src/main/res/xml/data_extraction_rules.xml')).toContain('sharedpref');
  });
  it('release network policy is HTTPS-only and names no environment-specific host', () => {
    const nsc = read('android/app/src/main/res/xml/network_security_config.xml');
    expect(nsc).toContain('cleartextTrafficPermitted="false"');
    expect(nsc).not.toMatch(/cleartextTrafficPermitted="true"/);
    expect(nsc).not.toMatch(/192\.168|10\.0\.2\.2|localhost|127\.0\.0\.1/);
  });
  it('plain HTTP is allowed only by the debug-variant override', () => {
    expect(read('android/app/src/debug/res/xml/network_security_config.xml')).toContain('cleartextTrafficPermitted="true"');
  });
  it('the signing config reads secrets from the environment, never from the repo', () => {
    const gradle = read('android/app/build.gradle');
    expect(gradle).toMatch(/System\.getenv\("KEYSTORE_PATH"\)/);
    expect(gradle).not.toMatch(/storePassword\s+["'][^"']+["']/);
    expect(gradle).not.toMatch(/keyPassword\s+["'][^"']+["']/);
  });
});

describe('build-android.mjs guard', () => {
  const run = (mode: string, env: Record<string, string>) => {
    const dir = mkdtempSync(join(tmpdir(), 'vv-'));
    writeFileSync(join(dir, '.env'), '');
    const r = spawnSync('node', [join(root, 'scripts/build-android.mjs'), mode, '--check'], {
      cwd: dir, env: { PATH: process.env.PATH ?? '', ...env } as unknown as NodeJS.ProcessEnv, encoding: 'utf8',
    });
    return { code: r.status, out: r.stdout + r.stderr };
  };
  it('release accepts a public https API', () => {
    expect(run('release', { NEXT_PUBLIC_API_URL: 'https://api.example.org/api' }).code).toBe(0);
  });
  it.each([
    ['http API', { NEXT_PUBLIC_API_URL: 'http://api.example.org/api' }],
    ['emulator address', { NEXT_PUBLIC_API_URL: 'https://10.0.2.2:8000/api' }],
    ['LAN address', { NEXT_PUBLIC_API_URL: 'https://192.168.1.7:8000/api' }],
    ['localhost', { NEXT_PUBLIC_API_URL: 'https://localhost/api' }],
    ['missing URL', {}],
    ['dev flag CAP_DEV', { NEXT_PUBLIC_API_URL: 'https://api.example.org/api', CAP_DEV: 'true' }],
    ['dev flag ALLOW_INSECURE', { NEXT_PUBLIC_API_URL: 'https://api.example.org/api', NEXT_PUBLIC_ALLOW_INSECURE_API: 'true' }],
  ])('release refuses: %s', (_name, env) => {
    const r = run('release', env as Record<string, string>);
    expect(r.code).toBe(1);
    expect(r.out).toContain('configuration problems');
  });
  it('dev accepts the emulator and LAN http URLs', () => {
    expect(run('dev', { NEXT_PUBLIC_API_URL: 'http://10.0.2.2:8000/api' }).code).toBe(0);
    expect(run('dev', { NEXT_PUBLIC_API_URL: 'http://192.168.1.7:8000/api' }).code).toBe(0);
  });
  it('an unknown mode is rejected', () => {
    expect(run('prod', { NEXT_PUBLIC_API_URL: 'https://x.org/api' }).code).toBe(2);
  });
});
