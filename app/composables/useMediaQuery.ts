/**
 * True while a CSS media query matches (client only; false during server
 * render). Used where wording changes by screen size, e.g. the chat message
 * box says "Say something..." on phones and "Type your message" on desktop.
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mq: MediaQueryList | undefined
  const update = (e: MediaQueryList | MediaQueryListEvent) => { matches.value = e.matches }
  onMounted(() => {
    mq = window.matchMedia(query)
    update(mq)
    mq.addEventListener('change', update)
  })
  onBeforeUnmount(() => mq?.removeEventListener('change', update))
  return matches
}

/** Phone layout (below the 768px breakpoint) */
export const usePhoneLayout = () => useMediaQuery('(max-width: 767px)')
