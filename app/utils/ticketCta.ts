import type { TicketType } from '~/types/ticket'

/**
 * Free tickets are RSVPs (decision 26 Oct).
 * - Something picked: free when every picked ticket costs 0.
 * - Nothing picked: free when the event only has free tickets.
 * As soon as a paid ticket is in the selection, the action is "Buy Ticket".
 */
export function isFreeOnly(tickets: TicketType[], quantities?: Record<string, number>): boolean {
  const picked = quantities ? tickets.filter(t => (quantities[t.id] ?? 0) > 0) : []
  const list = picked.length ? picked : tickets
  return list.length > 0 && list.every(t => t.price === 0)
}

export const RSVP_LABEL = 'RSVP'
