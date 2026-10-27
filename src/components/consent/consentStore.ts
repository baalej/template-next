import { useSyncExternalStore } from 'react'

// `null` means the visitor hasn't answered yet.
export type Consent = 'granted' | 'denied' | null

// Bump the version when what you ask consent for changes, so everyone is asked again.
const STORAGE_KEY = 'cookie-consent:v1'

// Kept apart from the stored answer: reopening the banner to reconsider must not
// change what the visitor already chose until they pick again.
let settingsOpen = false

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function read(): Consent {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    // Storage blocked (private mode, disabled site data): ask every visit.
    return null
  }
}

export function setConsent(consent: 'granted' | 'denied') {
  try {
    localStorage.setItem(STORAGE_KEY, consent)
  } catch {}
  settingsOpen = false
  emit()
}

export function openConsentSettings() {
  settingsOpen = true
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Keeps other open tabs in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

// The server snapshot is `undefined`, distinct from `null`, so nothing renders
// during SSR and the banner doesn't flash for visitors who already answered.
export function useConsent(): Consent | undefined {
  return useSyncExternalStore<Consent | undefined>(subscribe, read, () => undefined)
}

export function useConsentBannerOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => settingsOpen || read() === null,
    () => false,
  )
}
