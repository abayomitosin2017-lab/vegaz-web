import type { SessionUser } from '~/types/auth'
import type { EventDetails } from '~/types/event'
import type { TicketType } from '~/types/ticket'
import type { DraftTicket, EventDraft, HostedEventOption, PlaceSuggestion, TicketKind, TicketKindOption } from '~/types/hosting'
import { createdEventIds, hostCategories, hostedEventIds, placesMock, ticketKinds } from '~/mocks/hosting'
import { catalog, eventById } from '~/mocks/eventCatalog'
import { guestPrice } from '~/utils/fees'
import { formatNaira } from '~/utils/money'

/**
 * Host an event: data service (MOCK, memory only).
 * Components call these functions and never import mocks. When the API is
 * ready, replace each body with a request and keep the return types.
 *
 * A created event is added to the demo catalog, so it opens on its own event
 * page and shows first on Home ("Upcoming", "Explore all") and All events
 * until the page is reloaded.
 *
 * OPEN ITEMS (engineering): create-event endpoint and payload; photo upload
 * and crop; who reviews an event before it is live; how a new edition is
 * linked to its event (chat room, members, edition number).
 */
const wait = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms))

export function getCategories(): string[] {
  return [...hostCategories]
}

export function getTicketKinds(): TicketKindOption[] {
  return structuredClone(ticketKinds)
}

/** Name a preset ticket gets on its card (Figma: "FIRST TO BUY") */
export function presetName(kind: TicketKind): string {
  const found = ticketKinds.find(k => k.id === kind)
  return (found?.label ?? '').toUpperCase()
}

/** Places matching what was typed (Location dialog) */
export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  await wait(120)
  return placesMock.filter(p => p.label.toLowerCase().includes(q)).slice(0, 3)
}

/** Events the signed-in host runs (new edition, Select event) */
export async function listHostEvents(): Promise<HostedEventOption[]> {
  await wait(150)
  return hostedEventIds
    .map(id => eventById[id]?.event)
    .filter((e): e is EventDetails => !!e)
    .map(({ id, title, location, dateLabel, imageUrl }) => ({ id, title, location, dateLabel, imageUrl }))
}

/** The event a new edition continues: title, about and photos to start from */
export async function getEditionBase(eventId: string): Promise<{ title: string; about: string; category: string; location: string } | null> {
  const e = eventById[eventId]?.event
  return e ? { title: e.title, about: e.about, category: e.category, location: e.location } : null
}

/**
 * Edition number for a new edition. MOCK: always "1.0" (decision 23 Oct).
 * OPEN ITEM: numbering rule (1.0, 2.0...) comes from the backend.
 */
export function nextEditionNumber(_eventId: string): string {
  return '1.0'
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "5:00PM, 23 May 2026" (the app's event date format) */
export function eventDateLabel(date: string, time: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const h12 = ((hh ?? 0) % 12) || 12
  return `${h12}:${String(mm ?? 0).padStart(2, '0')}${(hh ?? 0) < 12 ? 'AM' : 'PM'}, ${d} ${MONTHS[(m ?? 1) - 1]} ${y}`
}

/** Tickets as guests see them on the event page (fee included) */
function toTicketTypes(tickets: DraftTicket[]): TicketType[] {
  const out: TicketType[] = []
  for (const t of tickets) {
    t.lines.forEach((line, i) => {
      const suffix = t.kind === 'gender' ? (i === 0 ? ' · FEMALE' : ' · MALE') : ''
      const price = guestPrice(line.price)
      out.push({
        id: `${t.id}-${i}`,
        name: `${t.name}${suffix}`,
        price,
        priceLabel: formatNaira(price),
        description: line.description,
        availability: 'available',
        maxQuantity: line.quantity ?? undefined,
      })
    })
  }
  return out
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event'

/**
 * Publishes the event (MOCK: adds it to the demo catalog) and returns its id.
 * A new edition keeps the original event's chat and community.
 */
export async function createEvent(draft: EventDraft, user: SessionUser): Promise<string> {
  await wait(600)
  const base = draft.editionOf ? eventById[draft.editionOf]?.event : undefined
  let id = slug(draft.title)
  for (let n = 2; eventById[id]; n++) id = `${slug(draft.title)}-${n}`

  const photos = [...draft.photos]
  const cover = photos.splice(draft.coverIndex, 1)[0]
  const ordered = cover ? [cover, ...photos] : photos
  const me = { id: 'me', name: `${user.firstName} ${user.lastName}`.trim(), username: user.username, avatarUrl: user.avatarUrl }

  const event: EventDetails = {
    id,
    title: draft.title.trim(),
    location: draft.location,
    address: draft.location,
    dateLabel: eventDateLabel(draft.date, draft.time),
    startsAt: `${draft.date}T${draft.time}:00`,
    category: draft.category ?? '',
    imageUrl: ordered[0]?.url,
    photos: ordered.map(p => p.url),
    host: base?.host ?? me,
    about: draft.description.trim(),
    expectations: draft.expectations.map(({ title, description, imageUrl }) => ({ title, description, imageUrl })),
    communityCount: base?.communityCount ?? 1,
    members: base?.members ?? [{ person: me, isHost: true }],
    chatId: base?.chatId,
  }
  const entry = { event, tickets: toTicketTypes(draft.tickets) }
  catalog.unshift(entry)
  eventById[id] = entry
  createdEventIds.unshift(id)
  return id
}
