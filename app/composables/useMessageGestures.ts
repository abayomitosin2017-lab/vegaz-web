import type { Ref } from 'vue'

/**
 * Phone gestures on a chat message (decision 21 Oct). Used by ChatMessage.
 *
 * - Press and hold (HOLD_MS) -> opens the message's action menu ("Reply").
 *   The menu closes on a tap elsewhere, Escape, or scrolling.
 * - Swipe left or right -> the bubble follows the finger up to SWIPE_MAX px;
 *   letting go past SWIPE_TRIGGER starts a reply. It springs back either way
 *   (the spring is a CSS transition on the bubble).
 * - After a hold or a swipe, the click that follows is swallowed so it doesn't
 *   also open a photo or a profile.
 *
 * Only active while `enabled` is true (phone layout). Works with touch, pen
 * and mouse pointers. Vertical scrolling stays native: the bubble needs
 * `touch-action: pan-y` in CSS.
 */
const HOLD_MS = 450
const SWIPE_MAX = 64
const SWIPE_TRIGGER = SWIPE_MAX / 2
const MOVE_SLOP = 8 // px of movement before a press counts as a drag
const MENU_ROOM = 120 // px needed above the bubble to open the menu above it

interface Options {
  enabled: Ref<boolean>
  /** The whole message row: taps inside it don't close the menu */
  root: Ref<HTMLElement | null>
  /** The bubble that moves */
  bubble: Ref<HTMLElement | null>
  /** Selector for the menu, so clicks inside it aren't swallowed */
  menuSelector: string
  onReply: () => void
  /** Called after the menu opens (e.g. to focus its first item) */
  onMenuOpen?: () => void
}

export function useMessageGestures(o: Options) {
  const menuOpen = ref(false)
  const menuAbove = ref(true)
  const offset = ref(0)
  const dragging = ref(false)
  const swipeIconOpacity = computed(() => Math.min(1, Math.abs(offset.value) / SWIPE_TRIGGER))

  let holdTimer: ReturnType<typeof setTimeout> | undefined
  let start: { x: number; y: number; id: number } | null = null
  let mode: 'idle' | 'swipe' | 'scroll' = 'idle'
  let swallowClick = false

  function closeMenu() { menuOpen.value = false }
  function openMenu() {
    const r = o.bubble.value?.getBoundingClientRect()
    menuAbove.value = !r || r.top > MENU_ROOM
    menuOpen.value = true
    swallowClick = true
    navigator.vibrate?.(10)
    nextTick(() => o.onMenuOpen?.())
  }
  function reply() {
    closeMenu()
    o.onReply()
  }

  function onPointerDown(e: PointerEvent) {
    if (!o.enabled.value || e.button !== 0) return
    swallowClick = false
    start = { x: e.clientX, y: e.clientY, id: e.pointerId }
    mode = 'idle'
    clearTimeout(holdTimer)
    holdTimer = setTimeout(() => { if (mode === 'idle') openMenu() }, HOLD_MS)
  }
  function onPointerMove(e: PointerEvent) {
    if (!start || e.pointerId !== start.id) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (mode === 'idle' && Math.hypot(dx, dy) > MOVE_SLOP) {
      clearTimeout(holdTimer)
      mode = Math.abs(dx) > Math.abs(dy) && !menuOpen.value ? 'swipe' : 'scroll'
      if (mode === 'swipe') {
        dragging.value = true
        swallowClick = true
        o.bubble.value?.setPointerCapture?.(e.pointerId)
      }
    }
    if (mode === 'swipe') offset.value = Math.max(-SWIPE_MAX, Math.min(SWIPE_MAX, dx))
  }
  function onPointerEnd(e: PointerEvent) {
    if (!start || e.pointerId !== start.id) return
    clearTimeout(holdTimer)
    if (mode === 'swipe' && e.type === 'pointerup' && Math.abs(offset.value) >= SWIPE_TRIGGER) reply()
    dragging.value = false
    offset.value = 0
    start = null
    mode = 'idle'
  }
  function onClickCapture(e: MouseEvent) {
    if (!swallowClick) return
    swallowClick = false
    if ((e.target as HTMLElement).closest(o.menuSelector)) return
    e.stopPropagation()
    e.preventDefault()
  }
  /** Turns off the phone's own copy / select menu on messages */
  function onContextMenu(e: Event) { if (o.enabled.value) e.preventDefault() }

  // Close the menu on a tap elsewhere, Escape, or scrolling
  function onDocPointer(e: PointerEvent) { if (!o.root.value?.contains(e.target as Node)) closeMenu() }
  function onDocKey(e: KeyboardEvent) { if (e.key === 'Escape') closeMenu() }
  watch(menuOpen, (open) => {
    if (!import.meta.client) return
    const fn = open ? document.addEventListener : document.removeEventListener
    fn.call(document, 'pointerdown', onDocPointer as EventListener, true)
    fn.call(document, 'keydown', onDocKey as EventListener)
    fn.call(document, 'scroll', closeMenu, true)
  })
  watch(o.enabled, (on) => { if (!on) closeMenu() })
  onBeforeUnmount(() => { clearTimeout(holdTimer); closeMenu() })

  return {
    menuOpen, menuAbove, offset, dragging, swipeIconOpacity,
    reply,
    handlers: { onPointerDown, onPointerMove, onPointerEnd, onClickCapture, onContextMenu },
  }
}
