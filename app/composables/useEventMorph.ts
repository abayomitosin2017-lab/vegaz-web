/**
 * useEventMorph: the "card photo grows into the event page" transition
 * (decision 22 Oct, Airbnb-style).
 *
 * How it works: the browser's View Transitions API animates between two
 * elements that share a `view-transition-name`, one on the old page and one
 * on the new page. A name may only be used once per page, but the same event
 * can appear in several Home rows, so only the card that was clicked carries
 * the name. We remember which one here (source row + event id). The event
 * page gives the name to its first gallery photo when it is showing that
 * event, so the photo grows from the card, and shrinks back on Back.
 *
 * Browsers without View Transitions (Firefox today) simply change page.
 */
export const EVENT_MORPH_NAME = 'event-photo'

export function useEventMorph() {
  const active = useState<{ source: string; eventId: string } | null>('event-morph', () => null)

  /** Call when a card is clicked, before the page changes */
  function start(source: string, eventId: string) {
    active.value = { source, eventId }
  }
  /** The style for a card: carries the name only if it was the clicked one */
  const cardStyle = (source: string, eventId: string) =>
    active.value?.source === source && active.value.eventId === eventId
      ? { viewTransitionName: EVENT_MORPH_NAME }
      : undefined
  /** The style for the event page's first photo */
  const pageStyle = (eventId: string) =>
    active.value?.eventId === eventId ? { viewTransitionName: EVENT_MORPH_NAME } : undefined

  return { start, cardStyle, pageStyle }
}
