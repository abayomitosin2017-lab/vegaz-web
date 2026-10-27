import type { EventDetails, EventMember, EventSummary, HomeEvents } from '~/types/event'
import { homeEventsMock } from '~/mocks/events'
import { catalog, eventById } from '~/mocks/eventCatalog'
import { createdEventIds } from '~/mocks/hosting'
import { communityOf } from '~/mocks/community'
import { mockRequest } from './mockRequest'

/**
 * Events data service (MOCK). Components never import mocks directly; they
 * call these functions. When the API is ready, replace each body with a real
 * request (for example `$fetch('/api/...')`) and keep the return types.
 *
 * OPEN ITEMS (engineering): endpoints; how each home section is chosen
 * ("this week", "hot", "upcoming", "explore all"); how search matches events
 * (this mock matches title, place and category).
 */
const wait = (ms = 150) => mockRequest(ms)

const summary = ({ id, title, location, dateLabel, category, imageUrl }: EventDetails): EventSummary => ({ id, title, location, dateLabel, category, imageUrl })

export async function getHomeEvents(): Promise<HomeEvents> {
  await wait() // like a real request (the page shows placeholders meanwhile)
  const home = structuredClone(homeEventsMock)
  // Events hosted in this session show first in "Upcoming" and "Explore all"
  // (demo, decision 23 Oct). OPEN ITEM: how new events reach Home.
  const created = createdEventIds.map(id => eventById[id]?.event).filter((e): e is EventDetails => !!e).map(summary)
  home.upcoming.unshift(...created)
  home.exploreAll.unshift(...structuredClone(created))
  return home
}

/**
 * Every event, for the "All events" page (Home -> Explore all).
 * OPEN ITEM: order, paging and filters (this mock keeps the catalog order).
 */
export async function getAllEvents(): Promise<EventSummary[]> {
  await wait()
  return catalog.map(({ event: { id, title, location, dateLabel, category, imageUrl } }) => ({ id, title, location, dateLabel, category, imageUrl }))
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

/**
 * Everyone in an event's community, a page at a time ("View all", decision
 * 27 Oct). Host first. MOCK: invented people fill the list up to the count.
 * OPEN ITEM (engineering): endpoint and page size.
 */
export async function getCommunityMembers(eventId: string, offset = 0, limit = 30): Promise<{ members: EventMember[]; total: number }> {
  await wait()
  const event = eventById[eventId]?.event
  if (!event) return { members: [], total: 0 }
  const all = communityOf(eventId, event.members, Math.max(event.communityCount, event.members.length))
  return { members: structuredClone(all.slice(offset, offset + limit)), total: all.length }
}
