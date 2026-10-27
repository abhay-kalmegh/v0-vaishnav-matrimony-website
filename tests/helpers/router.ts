/** A tiny fake Next.js router shared by the mocked `next/navigation` and the test harness. */
export type Nav = { kind: 'push' | 'replace'; url: string };

export const nav = {
  url: '/login',
  history: [] as Nav[],
  listener: (_url: string) => {},
  reset(url = '/login') {
    this.url = url;
    this.history = [];
  },
  go(kind: Nav['kind'], url: string) {
    this.history.push({ kind, url });
    this.url = url;
    this.listener(url);
  },
};

export const router = {
  push: (url: string) => nav.go('push', url),
  replace: (url: string) => nav.go('replace', url),
  back: () => {},
  forward: () => {},
  refresh: () => {},
  prefetch: async () => {},
};

export const pathname = () => nav.url.split('?')[0];
export const search = () => (nav.url.includes('?') ? nav.url.slice(nav.url.indexOf('?') + 1) : '');
