import type { TicketType } from '~/types/ticket'
import { ticketQuantitiesMock, ticketTypesMock } from '~/mocks/tickets'
import { eventById } from '~/mocks/eventCatalog'

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
