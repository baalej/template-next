import 'dotenv/config'

import { pointAtTestDatabase } from './tests/setup/testDatabase'

// Every test file talks to the test database, never the dev one. Set here, per
// worker, because env changes made in globalSetup don't reach the workers.
pointAtTestDatabase()

// Node 22+ defines its own `localStorage` global, `undefined` unless Node is given
// --localstorage-file, and it shadows jsdom's. Put jsdom's storage back.
const dom = (globalThis as { jsdom?: { window: Window } }).jsdom
if (dom) {
  for (const key of ['localStorage', 'sessionStorage'] as const) {
    Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] })
  }
}
