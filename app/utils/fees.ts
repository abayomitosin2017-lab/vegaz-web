/**
 * Vegaz service fee on a paid ticket (decision 23 Oct, from the Figma note):
 * 10% of the host's price, capped at ₦3,000, added on top of it.
 * ₦50,000 -> guest pays ₦53,000; ₦10,000 -> ₦11,000; Free stays free.
 * OPEN ITEM (engineering/business): confirm the rule is applied on the
 * server, rounding, and whether it changes per host or event.
 */
export const FEE_RATE = 0.1
export const FEE_CAP = 3000

export function serviceFee(price: number): number {
  if (!price || price <= 0) return 0
  return Math.min(Math.round(price * FEE_RATE), FEE_CAP)
}

/** What the guest sees */
export function guestPrice(price: number): number {
  return price + serviceFee(price)
}
