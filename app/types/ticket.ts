/**
 * A ticket type as shown in the ticket option card (Figma 9832:32993).
 * Field names are a proposal for the API contract; engineering to confirm.
 */
export type TicketAvailability = 'available' | 'low' | 'sold-out'

export interface TicketType {
  id: string
  /** Shown in the card header exactly as given, e.g. "VIP TABLE" */
  name: string
  /**
   * Price as displayed, e.g. "Free", "₦10,000".
   * OPEN ITEM: the API will likely send an amount + currency; formatting rules
   * (Free label, ₦, thousands separator) need to be agreed.
   */
  priceLabel: string
  /** Price in naira as a number (0 = free), used for totals */
  price: number
  description: string
  availability: TicketAvailability
  /** Badge text for 'low' / 'sold-out', e.g. "5 ticket left", "Sold out" */
  availabilityLabel?: string
  /**
   * Most a buyer can pick (tickets left or a per-order limit).
   * OPEN ITEM: which rule applies is a backend decision.
   */
  maxQuantity?: number
}
