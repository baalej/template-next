import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload'

// Cached reads and Payload writes meet here. Frontend code caches Payload
// queries under a tag (`unstable_cache(fn, keys, { tags: [cacheTag('pages')] })`)
// and the collection clears that tag whenever a document changes, so editors see
// their changes on the next request and visitors otherwise get cached pages.
// See AGENTS.md → "Caching Payload data".

export const cacheTag = (collection: string) => `payload:${collection}`

function clear(collection: string) {
  try {
    // `expire: 0` rather than the 'max' profile: an editor who saves and then
    // reloads the page must see the change, not one more stale render.
    revalidateTag(cacheTag(collection), { expire: 0 })
  } catch {
    // Outside a Next request (the Payload CLI, a seed script, integration tests)
    // there is no Next cache to clear, and revalidateTag throws.
  }
}

/** Spread into a collection's `hooks` to clear its cache tag on every change. */
export function revalidateOnChange(collection: CollectionConfig['slug']) {
  const afterChange: CollectionAfterChangeHook = ({ doc }) => {
    clear(collection)
    return doc
  }
  const afterDelete: CollectionAfterDeleteHook = ({ doc }) => {
    clear(collection)
    return doc
  }
  return { afterChange: [afterChange], afterDelete: [afterDelete] }
}
