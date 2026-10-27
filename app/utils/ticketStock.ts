import type { TicketType } from '~/types/ticket'

/**
 * "N tickets left" countdown and Sold out (Figma Ticket 6698:6496,
 * decision 27 Oct). Works per ticket type:
 * - more than LOW_STOCK left (or no limit): no chip;
 * - LOW_STOCK or fewer: red chip with the clock, "5 tickets left" ...
 *   "1 ticket left", and "+" stops at what's left;
 * - none left: grey "Sold out" chip, price struck through, card faded,
 *   no quantity control.
 * Figma writes "5 ticket left"; we use correct plurals (PROPOSED).
 */
export const LOW_STOCK = 5

export function ticketsLeftLabel(n: number): string {
  return `${n} ${n === 1 ? 'ticket' : 'tickets'} left`
}

/** Sets availability, chip text and the most a buyer can pick from `remaining` */
export function applyStock(t: TicketType): TicketType {
  if (typeof t.remaining !== 'number') return t
  const n = Math.max(0, t.remaining)
  if (n === 0) {
    // keep a custom sold-out label the host set (e.g. "Pay at gate")
    const label = t.availability === 'sold-out' && t.availabilityLabel ? t.availabilityLabel : 'Sold out'
    return { ...t, remaining: 0, availability: 'sold-out', availabilityLabel: label, maxQuantity: 0 }
  }
  const maxQuantity = Math.min(t.maxQuantity ?? n, n)
  if (n <= LOW_STOCK) return { ...t, remaining: n, availability: 'low', availabilityLabel: ticketsLeftLabel(n), maxQuantity }
  return { ...t, remaining: n, availability: 'available', availabilityLabel: undefined, maxQuantity }
}
