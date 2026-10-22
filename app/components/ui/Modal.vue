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
 * was on close; the page behind does not scroll. Clicking the dimmed page
 * does not close it (forms would lose input).
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
  }>(),
  { width: 375, labelledby: undefined, fallbackFocus: undefined, phone: 'center', cardClass: undefined },
)
const emit = defineEmits<{ close: [] }>()

const card = ref<HTMLElement | null>(null)
let returnFocusTo: HTMLElement | null = null

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
    if (isOpen) {
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
  document.documentElement.style.overflow = ''
})

defineExpose({ focusFirst })
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-modal" appear>
    <div v-if="open" :class="['ui-modal', `ui-modal--${phone}`]">
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

/* ---- Motion ---- */
.ui-modal { --ui-modal-in: var(--duration-popup-in); --ui-modal-out: var(--duration-popup-out); }
.ui-modal-enter-active,
.ui-modal-enter-active .ui-modal__card {
  transition: opacity var(--ui-modal-in) var(--ease-out-strong), transform var(--ui-modal-in) var(--ease-out-strong);
}
.ui-modal-leave-active,
.ui-modal-leave-active .ui-modal__card {
  transition: opacity var(--ui-modal-out) var(--ease-out-strong), transform var(--ui-modal-out) var(--ease-out-strong);
}
.ui-modal-enter-from,
.ui-modal-leave-to { opacity: 0; }
.ui-modal-enter-from .ui-modal__card,
.ui-modal-leave-to .ui-modal__card { transform: scale(var(--scale-popup-from)); }

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
  /* Sheets slide up (drawer curve); full-screen cards just fade */
  .ui-modal--sheet { --ui-modal-in: var(--duration-sheet-in); --ui-modal-out: var(--duration-sheet-out); }
  .ui-modal--sheet.ui-modal-enter-active .ui-modal__card { transition-timing-function: var(--ease-drawer); }
  .ui-modal--sheet.ui-modal-enter-from .ui-modal__card,
  .ui-modal--sheet.ui-modal-leave-to .ui-modal__card { transform: translateY(100%); }
  .ui-modal--fullscreen.ui-modal-enter-from .ui-modal__card,
  .ui-modal--fullscreen.ui-modal-leave-to .ui-modal__card { transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-modal-enter-from .ui-modal__card,
  .ui-modal-leave-to .ui-modal__card,
  .ui-modal--sheet.ui-modal-enter-from .ui-modal__card,
  .ui-modal--sheet.ui-modal-leave-to .ui-modal__card { transform: none; }
}
</style>
