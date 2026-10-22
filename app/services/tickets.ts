import type { TicketType } from '~/types/ticket'
import { ticketQuantitiesMock, ticketTypesMock } from '~/mocks/tickets'
import { eventById } from '~/mocks/eventCatalog'
import { mockOwnedTickets, type OwnedTicketRecord } from '~/mocks/orders'

/**
 * Ticket data service (mock). Replace the bodies with real API calls later;
 * keep the return types. OPEN ITEM: endpoint, and whether selected
 * quantities are kept on the client or reserved on the server.
 */
/** Ticket types for an event ('preview' = the Figma variants for /dev/components) */
export async function getTicketTypes(eventId: string): Promise<TicketType[]> {
  if (eventId === 'preview') return structuredClone(ticketTypesMock)
  return structuredClone(eventById[eventId]?.tickets ?? [])
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
}
