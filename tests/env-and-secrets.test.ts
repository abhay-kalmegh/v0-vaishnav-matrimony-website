import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');

describe('repository hygiene', () => {
  it('no environment or credential files are tracked by git', () => {
    const tracked = execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n');
    const bad = tracked.filter((f) => /(^|\/)\.env(\.(local|production|development))?$/.test(f) || /local\.properties$|\.(jks|keystore)$/.test(f));
    expect(bad).toEqual([]);
  });
  it('the example env files exist and contain no real-looking secrets', () => {
    for (const f of ['.env.example', 'backend/.env.example']) {
      const text = readFileSync(join(root, f), 'utf8');
      expect(text).not.toMatch(/AKIA[0-9A-Z]{16}|sk_(live|test)_|-----BEGIN/);
      expect(text).not.toMatch(/SECRET_KEY=\S{20,}/);
    }
  });
  it('built web assets (if present) contain no server-side secrets', () => {
    const out = join(root, 'out');
    const files: string[] = [];
    const walk = (d: string) => readdirSync(d).forEach((n) => {
      const p = join(d, n);
      statSync(p).isDirectory() ? walk(p) : /\.(js|html|json|txt)$/.test(n) && files.push(p);
    });
    try { walk(out); } catch { return; /* not built yet */ }
    for (const f of files) expect(readFileSync(f, 'utf8'), f).not.toMatch(/DATABASE_URL|SECRET_KEY|BEGIN (RSA )?PRIVATE KEY|sk_live_/);
  });
});
