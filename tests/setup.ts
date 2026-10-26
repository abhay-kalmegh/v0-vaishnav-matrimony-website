import { vi } from 'vitest';
import React from 'react';

// In-memory stand-in for Capacitor Preferences (the web fallback uses localStorage, which jsdom provides).
vi.mock('@capacitor/preferences', () => {
  const store = new Map<string, string>();
  return {
    Preferences: {
      get: async ({ key }: { key: string }) => ({ value: store.get(key) ?? null }),
      set: async ({ key, value }: { key: string; value: string }) => void store.set(key, value),
      remove: async ({ key }: { key: string }) => void store.delete(key),
      clear: async () => store.clear(),
    },
  };
});

vi.mock('next/navigation', async () => {
  const r = await import('./helpers/router');
  return {
    useRouter: () => r.router,
    usePathname: () => r.pathname(),
    useSearchParams: () => new URLSearchParams(r.search()),
  };
});

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => React.createElement('a', { href, ...rest }, children),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), message: vi.fn() }, Toaster: () => null }));
