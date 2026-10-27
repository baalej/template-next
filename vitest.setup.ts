// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Node 22+ defines its own `localStorage` global, `undefined` unless Node is given
// --localstorage-file, and it shadows jsdom's. Put jsdom's storage back.
const dom = (globalThis as { jsdom?: { window: Window } }).jsdom
if (dom) {
  for (const key of ['localStorage', 'sessionStorage'] as const) {
    Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] })
  }
}
