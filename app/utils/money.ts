/**
 * Money display helpers (naira, whole amounts).
 * OPEN ITEM: confirm formatting with design/engineering once the API sends
 * amounts (currency, kobo, "Free" label).
 */
export function formatNaira(amount: number): string {
  return amount === 0 ? 'Free' : `₦${Math.round(amount).toLocaleString('en-NG')}`
}

/** "₦15,000 - ₦100,000", "Free - ₦10,000", or a single price when all match */
export function priceRange(prices: number[]): string {
  if (!prices.length) return ''
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatNaira(min) : `${formatNaira(min)} - ${formatNaira(max)}`
}
