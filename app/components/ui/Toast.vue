<script setup lang="ts">
/**
 * UiToast: a short confirmation that appears near the bottom of the screen
 * and goes away on its own (e.g. "Link copied").
 * NOT IN FIGMA (proposed, 21 Oct): dark pill (Grey_1 at 92%), white Web Small
 * text, 16 / 8 padding, 24px above the bottom edge. Screen readers hear the
 * message once (role="status").
 *
 * Usage: <UiToast :message="toast" @done="toast = ''" />
 */
const props = withDefaults(defineProps<{ message: string; duration?: number }>(), { duration: 2000 })
const emit = defineEmits<{ done: [] }>()

let timer: ReturnType<typeof setTimeout> | undefined
watch(
  () => props.message,
  (m) => {
    clearTimeout(timer)
    if (m) timer = setTimeout(() => emit('done'), props.duration)
  },
  { immediate: true },
)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <Teleport to="body">
    <div class="ui-toast" role="status" aria-live="polite">
      <Transition name="ui-toast">
        <p v-if="message" class="ui-toast__pill text-small-regular">{{ message }}</p>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.ui-toast {
  position: fixed;
  inset: auto 0 var(--spacing-lg);
  z-index: 1000;
  display: flex;
  justify-content: center;
  padding-inline: var(--spacing-md);
  pointer-events: none;
}
.ui-toast__pill {
  max-width: 100%;
  margin: 0;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-pill);
  background: var(--color-viewer-overlay);
  color: var(--color-text-inverse);
  text-align: center;
}
.ui-toast-enter-active,
.ui-toast-leave-active { transition: opacity 150ms ease, transform 150ms ease; }
.ui-toast-enter-from,
.ui-toast-leave-to { opacity: 0; transform: translateY(8px); }
@media (prefers-reduced-motion: reduce) {
  .ui-toast-enter-active,
  .ui-toast-leave-active { transition: none; }
}
</style>
