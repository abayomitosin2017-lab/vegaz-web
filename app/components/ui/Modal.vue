<script setup lang="ts">
/**
 * UiModal: centred dialog from the Figma onboarding frames (section 10656:49108).
 *
 * Figma: page dimmed with white at 70%; white card, radius 24, Dp2 shadow,
 * padding 24 (16 below 768px). Card width is set per use with `width`
 * (Figma: 375-441px); it is never wider than the screen minus 20px each side
 * (353px on a 393px phone).
 *
 * Phones (< 768px), `phone` prop:
 *   center      the card stays centred (onboarding)
 *   sheet       bottom sheet: full width, top corners 24, padding 24 / 24 /
 *               40, page dimmed with black at 50% (Figma buy ticket frames)
 *   fullscreen  the card fills the screen (Figma purchase success)
 * The card's look can be changed by the parent through `card-class`.
 *
 * Behaviour (standard dialog, not drawn in Figma): Escape closes; focus moves
 * into the dialog on open, stays inside while open, and returns to where it
 * was on close; the page behind does not scroll.
 * Clicking the dimmed page closes it (decision 26 Oct), except:
 *   - once something has been typed or changed in a field inside it (so
 *     input isn't lost; X / Cancel / Escape still close),
 *   - while it is busy (anything inside marked aria-busy="true", e.g. paying),
 *   - when the parent passes :dismissible="false" (success screens, saving).
 * Phones, on-screen keyboard (decision 26 Oct): the dialog area follows the
 * visible part of the screen (visualViewport), so sheets sit on top of the
 * keyboard, the card shrinks to the space left and scrolls, and the focused
 * field is scrolled into view.
 *
 * Motion (decision 22 Oct, "very subtle"): the dimmed page fades; the card
 * grows from 96% (200ms in, 150ms out). Phone sheets slide up from the
 * bottom instead (250ms in, 200ms out); full-screen cards only fade.
 * "Reduce motion": fade only.
 */
const props = withDefaults(
  defineProps<{
    open: boolean
    /** Card width in px on 768px and wider screens */
    width?: number
    /** Accessible name: id of the visible title element */
    labelledby?: string
    /** Where focus goes on close if the element that opened the modal is gone
        (e.g. "Login or signup" replaced by the profile button after sign-in) */
    fallbackFocus?: string
    /** Layout below 768px (see above) */
    phone?: 'center' | 'sheet' | 'fullscreen'
    /** Extra class on the card, to restyle it (e.g. purple success card) */
    cardClass?: string
    /** Clicking the dimmed page closes it (default). false: only X / Escape */
    dismissible?: boolean
  }>(),
  { width: 375, labelledby: undefined, fallbackFocus: undefined, phone: 'center', cardClass: undefined, dismissible: true },
)
const emit = defineEmits<{ close: [] }>()

const card = ref<HTMLElement | null>(null)
let returnFocusTo: HTMLElement | null = null

// ---- Click outside to close (unless typed in, busy, or not dismissible) ----
let dirty = false
let downOnBackdrop = false
function onInput() { dirty = true }
function onBackdropDown(e: PointerEvent) { downOnBackdrop = e.target === e.currentTarget }
function onBackdropClick(e: MouseEvent) {
  const fromBackdrop = downOnBackdrop && e.target === e.currentTarget
  downOnBackdrop = false
  if (!fromBackdrop || !props.dismissible || dirty) return
  if (card.value?.querySelector('[aria-busy="true"]')) return
  emit('close')
}

// ---- Phones: keep the dialog in the part of the screen the keyboard leaves ----
const viewport = ref<{ top: number; height: number } | null>(null)
function syncViewport() {
  const vv = window.visualViewport
  if (!vv) return
  const covered = window.innerHeight - vv.height
  viewport.value = covered > 80 ? { top: vv.offsetTop, height: vv.height } : null // > 80: a keyboard, not a browser bar
  if (viewport.value) nextTick(revealFocused)
}
function revealFocused() {
  const el = document.activeElement as HTMLElement | null
  if (el && card.value?.contains(el) && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) el.scrollIntoView({ block: 'nearest' })
}
function watchViewport(on: boolean) {
  const vv = window.visualViewport
  if (!vv) return
  if (on) { vv.addEventListener('resize', syncViewport); vv.addEventListener('scroll', syncViewport); syncViewport() }
  else { vv.removeEventListener('resize', syncViewport); vv.removeEventListener('scroll', syncViewport); viewport.value = null }
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

function focusFirst() {
  const el = card.value?.querySelector<HTMLElement>('[data-autofocus]') ?? card.value?.querySelector<HTMLElement>(FOCUSABLE)
  el?.focus()
}

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
    return
  }
  if (e.key !== 'Tab' || !card.value) return
  const items = [...card.value.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(el => el.offsetParent !== null)
  if (!items.length) return
  const first = items[0]!
  const last = items[items.length - 1]!
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}

watch(
  () => props.open,
  async (isOpen, wasOpen) => {
    if (!import.meta.client) return
    if (!isOpen && !wasOpen) return // created closed: nothing to undo
    watchViewport(isOpen)
    if (isOpen) {
      dirty = false
      returnFocusTo = document.activeElement as HTMLElement | null
      document.documentElement.style.overflow = 'hidden'
      await nextTick()
      focusFirst()
    } else {
      document.documentElement.style.overflow = ''
      await nextTick() // let the page update first (e.g. the header after sign-in)
      const fallback = props.fallbackFocus
        ? [...document.querySelectorAll<HTMLElement>(props.fallbackFocus)].find(el => el.offsetParent !== null)
        : undefined
      ;(returnFocusTo?.isConnected ? returnFocusTo : fallback)?.focus?.()
    }
  },
  { immediate: true }, // also when the dialog is created already open
)

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  if (import.meta.client) watchViewport(false)
  document.documentElement.style.overflow = ''
})

defineExpose({ focusFirst })
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-modal" appear>
    <div
      v-if="open"
      :class="['ui-modal', `ui-modal--${phone}`, { 'ui-modal--keyboard': viewport }]"
      :style="viewport ? { top: `${viewport.top}px`, height: `${viewport.height}px`, bottom: 'auto' } : undefined"
      @pointerdown="onBackdropDown"
      @click="onBackdropClick"
      @input.capture="onInput"
      @change.capture="onInput"
      @focusin="viewport && nextTick(revealFocused)"
    >
      <div
        ref="card"
        :class="['ui-modal__card', cardClass]"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="labelledby"
        :style="{ '--ui-modal-width': `${width}px` }"
      >
        <slot />
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ui-modal {
  position: fixed;
  inset: 0;
  z-index: 1000; /* above the sticky header */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg) var(--container-inset-mobile);
  overflow-y: auto;
  background: var(--color-overlay);
}
.ui-modal__card {
  box-sizing: border-box;
  width: min(var(--ui-modal-width), 100%);
  margin: auto;
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-dp2);
  overflow: clip; /* Figma: clip content */
  overflow-clip-margin: var(--spacing-xs); /* keep focus rings visible */
}
/* On a phone the card is capped by the 20px side padding above (353px on a
   393px screen, as in the Figma mobile frames). */
@media (min-width: 768px) {
  .ui-modal__card { padding: var(--spacing-lg); }
}

/* ---- Motion: none (decision 26 Oct: modal animations glitched). Modals
   and sheets appear and disappear instantly. ---- */

/* Phones: bottom sheet / full screen */
@media (max-width: 767px) {
  .ui-modal--sheet,
  .ui-modal--fullscreen { padding: 0; background: var(--color-overlay-sheet); }
  .ui-modal--sheet { align-items: flex-end; }
  .ui-modal--sheet .ui-modal__card {
    width: 100%;
    max-height: calc(100dvh - var(--spacing-3xl));
    margin: auto 0 0;
    padding: var(--spacing-lg) var(--spacing-lg) calc(var(--spacing-2xl) + env(safe-area-inset-bottom, 0px));
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    box-shadow: none;
    overflow-y: auto;
  }
  .ui-modal--fullscreen .ui-modal__card {
    width: 100%;
    min-height: 100dvh;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }
  /* Keyboard open: the dialog area is the visible part of the screen */
  .ui-modal--keyboard .ui-modal__card { max-height: calc(100% - var(--spacing-lg)); overflow-y: auto; }
  .ui-modal--keyboard.ui-modal--sheet .ui-modal__card { padding-bottom: var(--spacing-lg); }
  .ui-modal--keyboard.ui-modal--fullscreen .ui-modal__card { min-height: 100%; max-height: 100%; }
}
</style>
