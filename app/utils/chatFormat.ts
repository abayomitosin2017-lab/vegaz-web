/**
 * Display formats seen in the Figma chat screens.
 * OPEN ITEM: confirm with design/engineering (time zone, locale).
 */
const pad = (n: number) => String(n).padStart(2, '0')

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Message time: "10:30 PM", "05:22 AM" */
export function formatClock(iso: string) {
  const d = new Date(iso)
  const h = d.getHours() % 12 || 12
  return `${pad(h)}:${pad(d.getMinutes())} ${d.getHours() < 12 ? 'AM' : 'PM'}`
}

/** List time: today "10:34 PM", yesterday "Yesterday", older "2/02/25" (M/DD/YY:
    Figma lists "2/02/25" above "1/05/25", so 1/05/25 is 5 January) */
export function formatListTime(iso: string, now = new Date()) {
  const d = new Date(iso)
  if (sameDay(d, now)) return formatClock(iso)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (sameDay(d, yesterday)) return 'Yesterday'
  return `${d.getMonth() + 1}/${pad(d.getDate())}/${String(d.getFullYear()).slice(-2)}`
}

/** Day separator in a conversation: "TODAY", "YESTERDAY", "2 FEB 2025" (only TODAY is in Figma) */
export function formatDayLabel(iso: string, now = new Date()) {
  const label = formatListTime(iso, now)
  if (label === 'Yesterday') return 'YESTERDAY'
  const d = new Date(iso)
  if (sameDay(d, now)) return 'TODAY'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
}

export function isSameDay(a: string, b: string) {
  return sameDay(new Date(a), new Date(b))
}

/** Unread badge: 3, 90, 128, "2.6k" */
export function formatCount(n: number) {
  if (n < 1000) return String(n)
  const k = Math.round(n / 100) / 10
  return `${k % 1 === 0 ? k.toFixed(0) : k}k`
}
