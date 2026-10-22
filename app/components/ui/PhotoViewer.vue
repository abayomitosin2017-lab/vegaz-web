<script setup lang="ts">
/**
 * UiPhotoViewer: shows photos full size over the page (chat photo messages).
 * Not in Figma: built from existing styles (decision 21 Oct, "click a photo
 * to see the full image"). Needs design review.
 *
 * Dark backdrop; the photo fits the screen without cropping; "2 / 4" count at
 * the top left and a white round close button (X) at the top right; with more
 * than one photo, white round previous / next buttons on the sides. The
 * message caption, if any, shows under the photo.
 *
 * Keyboard: Escape closes, Left / Right arrows change photo, Tab stays inside.
 * Clicking the dark area around the photo also closes. Focus returns to the
 * photo that was clicked.
 */
const props = withDefaults(
  defineProps<{ open: boolean; photos: string[]; index?: number; caption?: string; label?: string }>(),
  { index: 0, caption: undefined, label: 'Photo' },
)
const emit = defineEmits<{ close: []; 'update:index': [value: number] }>()

const root = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
let returnFocusTo: HTMLElement | null = null

const count = computed(() => props.photos.length)
const current = computed(() => props.photos[props.index] ?? '')

function go(step: number) {
  if (count.value < 2) return
  emit('update:index', (props.index + step + count.value) % count.value)
}
function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') { e.preventDefault(); emit('close') }
  else if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
  else if (e.key === 'Tab' && root.value) {
    const items = [...root.value.querySelectorAll<HTMLElement>('button')]
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!import.meta.client) return
    if (isOpen) {
      returnFocusTo = document.activeElement as HTMLElement | null
      document.documentElement.style.overflow = 'hidden'
      await nextTick()
      closeButton.value?.focus()
    } else {
      document.documentElement.style.overflow = ''
      returnFocusTo?.focus?.()
    }
  },
)
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="root"
      class="ui-viewer"
      role="dialog"
      aria-modal="true"
      :aria-label="label"
      @click.self="emit('close')"
    >
      <p class="ui-viewer__count text-small-semibold" aria-live="polite">
        <template v-if="count > 1">{{ index + 1 }} / {{ count }}</template>
      </p>
      <button ref="closeButton" type="button" class="ui-viewer__button ui-viewer__close" aria-label="Close photo" @click="emit('close')">
        <img src="/images/chat/icon-close-20.svg" alt="" width="20" height="20" />
      </button>

      <figure class="ui-viewer__figure" @click.self="emit('close')">
        <img v-if="current" class="ui-viewer__image" :src="current" :alt="`${label}${count > 1 ? `, ${index + 1} of ${count}` : ''}`" />
        <span v-else class="ui-viewer__placeholder" role="img" :aria-label="`${label} (not available yet)`" />
        <figcaption v-if="caption" class="ui-viewer__caption text-small-regular">{{ caption }}</figcaption>
      </figure>

      <template v-if="count > 1">
        <button type="button" class="ui-viewer__button ui-viewer__nav ui-viewer__nav--prev" aria-label="Previous photo" @click="go(-1)">
          <img src="/images/icon-arrow-down-16.svg" alt="" width="16" height="16" />
        </button>
        <button type="button" class="ui-viewer__button ui-viewer__nav ui-viewer__nav--next" aria-label="Next photo" @click="go(1)">
          <img src="/images/icon-arrow-down-16.svg" alt="" width="16" height="16" />
        </button>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.ui-viewer {
  position: fixed;
  inset: 0;
  z-index: 1100; /* above modals and the sticky header */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl) 88px;
  background: var(--color-viewer-overlay);
}
.ui-viewer__count {
  position: absolute;
  top: var(--spacing-lg);
  left: var(--spacing-lg);
  margin: 0;
  color: var(--color-text-inverse);
}
.ui-viewer__button {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--sizing-control-compact);
  height: var(--sizing-control-compact);
  padding: 0;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--color-background-primary);
  cursor: pointer;
}
.ui-viewer__button:focus-visible {
  outline: var(--focus-ring-width) solid var(--color-text-inverse);
  outline-offset: var(--focus-ring-offset);
}
.ui-viewer__close { top: var(--spacing-md); right: var(--spacing-lg); }
.ui-viewer__nav { top: 50%; translate: 0 -50%; }
.ui-viewer__nav--prev { left: var(--spacing-lg); }
.ui-viewer__nav--next { right: var(--spacing-lg); }
/* The supplied down arrow, turned to point left / right */
.ui-viewer__nav--prev img { rotate: 90deg; }
.ui-viewer__nav--next img { rotate: -90deg; }

.ui-viewer__figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  max-width: 100%;
  max-height: 100%;
  margin: 0;
}
.ui-viewer__image {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 2 * var(--spacing-4xl) - 80px);
  border-radius: var(--radius-sm);
  object-fit: contain;
}
.ui-viewer__placeholder {
  display: block;
  width: min(60vmin, 520px);
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  background: var(--color-placeholder-media);
}
.ui-viewer__caption {
  max-width: 600px;
  margin: 0;
  color: var(--color-text-inverse);
  text-align: center;
  overflow-wrap: anywhere;
}
</style>
