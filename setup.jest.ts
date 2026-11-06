// jest.setup.ts
import { TextEncoder, TextDecoder } from 'util';
import { BroadcastChannel } from 'worker_threads';
import 'whatwg-fetch';

Object.assign(global, { TextEncoder, TextDecoder, BroadcastChannel });

// jsdom has no matchMedia, so components that read a media query render the desktop layout.
if (typeof window !== 'undefined') {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }) as unknown as MediaQueryList;
}

// Hook tests change no DOM, so `waitFor` checks them again only on its timer. Check every 5 ms instead
// of Testing Library's 50 ms. A call that passes its own `interval` keeps it. A setup file shares each
// test file's module registry, so this mock reaches every test file.
jest.mock('@testing-library/react', () => {
  const actual: typeof import('@testing-library/react') = jest.requireActual('@testing-library/react');
  const waitFor: typeof actual.waitFor = (callback, options) => actual.waitFor(callback, { interval: 5, ...options });
  return { __esModule: true, ...actual, waitFor };
});
