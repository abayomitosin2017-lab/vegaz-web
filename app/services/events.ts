import type { EventDetails, EventSummary, HomeEvents } from '~/types/event'
import { homeEventsMock } from '~/mocks/events'
import { catalog, eventById } from '~/mocks/eventCatalog'

/**
 * Events data service (MOCK). Components never import mocks directly; they
 * call these functions. When the API is ready, replace each body with a real
 * request (for example `$fetch('/api/...')`) and keep the return types.
 *
 * OPEN ITEMS (engineering): endpoints; how each home section is chosen
 * ("this week", "hot", "upcoming", "explore all"); how search matches events
 * (this mock matches title, place and category).
 */
const wait = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms))

export async function getHomeEvents(): Promise<HomeEvents> {
  return structuredClone(homeEventsMock)
}

/** One event for the details page; null when it doesn't exist */
export async function getEvent(id: string): Promise<EventDetails | null> {
  await wait()
  const found = eventById[id]
  return found ? structuredClone(found.event) : null
}

/** Events whose title, place or category contains the query (header search) */
export async function searchEvents(query: string, limit = 6): Promise<EventSummary[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  await wait(80)
  return catalog
    .map(c => c.event)
    .filter(e => [e.title, e.location, e.category].some(v => v.toLowerCase().includes(q)))
    .slice(0, limit)
    .map(({ id, title, location, dateLabel, category, imageUrl }) => ({ id, title, location, dateLabel, category, imageUrl }))
}
