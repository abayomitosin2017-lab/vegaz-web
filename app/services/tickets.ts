import type { TicketType } from '~/types/ticket'
import { applyStock, LOW_STOCK } from '~/utils/ticketStock'
import { ticketQuantitiesMock, ticketTypesMock } from '~/mocks/tickets'
import { eventById } from '~/mocks/eventCatalog'
import { mockOwnedTickets, type OwnedTicketRecord } from '~/mocks/orders'
import { mockRequest } from './mockRequest'

/**
 * Ticket data service (mock). Replace the bodies with real API calls later;
 * keep the return types. OPEN ITEM: endpoint, and whether selected
 * quantities are kept on the client or reserved on the server.
 */
const wait = (ms = 150) => mockRequest(ms)

// ---- Stock (MOCK, memory only): tickets left per type ----
// Starts from the catalog (a "low" tier's limit, 0 for sold out, a host's
// quantity); goes down when tickets are bought here or (demo) by others.
const stock: Record<string, Record<string, number>> = {}
function stockOf(eventId: string): Record<string, number> {
  if (!stock[eventId]) {
    const start: Record<string, number> = {}
    for (const t of eventById[eventId]?.tickets ?? []) {
      const n = typeof t.remaining === 'number' ? t.remaining : t.availability === 'sold-out' ? 0 : t.maxQuantity
      if (typeof n === 'number') start[t.id] = n
    }
    stock[eventId] = start
  }
  return stock[eventId]!
}
function withStock(eventId: string): TicketType[] {
  const left = stockOf(eventId)
  return (eventById[eventId]?.tickets ?? []).map(t => applyStock(t.id in left ? { ...structuredClone(t), remaining: left[t.id] } : structuredClone(t)))
}

/** Ticket types for an event, with what's left ('preview' = the Figma variants for /dev/components) */
export async function getTicketTypes(eventId: string): Promise<TicketType[]> {
  await wait()
  if (eventId === 'preview') return structuredClone(ticketTypesMock)
  return withStock(eventId)
}

/**
 * Live updates while the event page is open; returns a stop function.
 * DEMO ONLY (decision 27 Oct): every 20 seconds someone else "buys" one ticket
 * of a type that's down to 5 or fewer, so the countdown and Sold out can be
 * seen. OPEN ITEM (engineering): replace with a push (WebSocket / SSE) or
 * polling of the real stock.
 */
export function watchTicketStock(eventId: string, onChange: (tickets: TicketType[]) => void): () => void {
  const timer = setInterval(() => {
    const left = stockOf(eventId)
    const low = Object.keys(left).filter(id => left[id]! > 0 && left[id]! <= LOW_STOCK)
    if (!low.length) return
    const id = low[Math.floor(Math.random() * low.length)]!
    left[id] = left[id]! - 1
    onChange(withStock(eventId))
  }, 20_000)
  return () => clearInterval(timer)
}

/** Preview only: the starting quantities from the Figma variants. */
export function getPreviewQuantities(): Record<string, number> {
  return { ...ticketQuantitiesMock }
}

// ---- Tickets people hold (MOCK, memory only) ----
// OPEN ITEM (engineering): "my tickets" endpoint; whether guests assigned a
// ticket need to accept it; tickets are matched to people by email here.
const owned: OwnedTicketRecord[] = structuredClone(mockOwnedTickets)
const same = (a?: string, b?: string) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase()

/** How many tickets this email holds for an event (bought or assigned) */
export function ticketsHeld(email: string | undefined, eventId: string | undefined): number {
  if (!email || !eventId) return 0
  return owned.filter(t => t.eventId === eventId && same(t.email, email)).length
}

/** Records tickets after a successful order (called by services/checkout.ts) */
export function recordTickets(list: OwnedTicketRecord[]): void {
  owned.push(...structuredClone(list))
  for (const t of list) {
    const left = stockOf(t.eventId)
    if (typeof left[t.ticketId] === 'number') left[t.ticketId] = Math.max(0, left[t.ticketId]! - 1)
  }
}
