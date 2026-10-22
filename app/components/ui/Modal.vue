<script setup lang="ts">
/**
 * UiModal: centred dialog from the Figma onboarding frames (section 10656:49108).
 *
 * Figma: page dimmed with white at 70%; white card, radius 24, Dp2 shadow,
 * padding 24 (16 below 768px). Card width is set per use with `width`
 * (Figma: 375-441px); it is never wider than the screen minus 20px each side
 * (353px on a 393px phone).
 *
 * Behaviour (standard dialog, not drawn in Figma): Escape closes; focus moves
 * into the dialog on open, stays inside while open, and returns to where it
 * was on close; the page behind does not scroll. Clicking the dimmed page
 * does not close it (forms would lose input).
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
  }>(),
  { width: 375, labelledby: undefined, fallbackFocus: undefined },
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
  async (isOpen) => {
    if (!import.meta.client) return
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
    <div v-if="open" class="ui-modal">
      <div
        ref="card"
        class="ui-modal__card"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="labelledby"
        :style="{ '--ui-modal-width': `${width}px` }"
      >
        <slot />
      </div>
    </div>
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
</style>
