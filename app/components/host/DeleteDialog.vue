<script setup lang="ts">
import './styles.css'
/**
 * Delete Ticket (Figma frame 16): close X at the top, 72px #141316 circle
 * with the red 40px trash, title "Delete Ticket" (H1 app bold 32/40),
 * "Are you sure you want to delete this ticket?" (Body app regular 16/24),
 * red "Delete" button; 40 apart. Also used for "What to expect" items with
 * different words (copy proposed, not drawn).
 */
withDefaults(defineProps<{ open: boolean; title?: string; copy?: string }>(), {
  title: 'Delete Ticket',
  copy: 'Are you sure you want to delete this ticket?',
})
const emit = defineEmits<{ close: []; confirm: [] }>()
const id = useId()
</script>

<template>
  <UiModal :open="open" :width="441" :labelledby="`${id}-t`" phone="sheet" @close="emit('close')">
    <div class="host-del">
      <button type="button" class="host-dialog__close host-del__close" aria-label="Close" @click="emit('close')">
        <img src="/images/host/icon-close-16.svg" alt="" width="16" height="16" />
      </button>
      <div class="host-del__body">
        <span class="host-del__icon" aria-hidden="true"><img src="/images/host/icon-trash-40.svg" alt="" width="40" height="40" /></span>
        <div class="host-del__text">
          <h2 :id="`${id}-t`" class="host-del__title text-app-h1-bold">{{ title }}</h2>
          <p class="host-del__copy text-app-body-regular">{{ copy }}</p>
        </div>
        <button type="button" class="host-del__btn text-app-body-semibold" data-autofocus @click="emit('confirm')">Delete</button>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.host-del { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.host-del__close { align-self: flex-start; margin: 0; }
.host-del__body { display: flex; flex-direction: column; gap: var(--spacing-2xl); }
.host-del__icon { display: inline-flex; width: fit-content; padding: var(--spacing-md); border-radius: var(--radius-pill); background: var(--color-host-delete-circle); }
.host-del__text { display: flex; flex-direction: column; gap: var(--spacing-xxs); padding: var(--spacing-xs) 0; }
.host-del__title { margin: 0; color: var(--color-text-checkout); }
.host-del__copy { margin: 0; color: var(--color-text-secondary); }
.host-del__btn {
  min-height: var(--sizing-control-standard);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-host-danger);
  color: var(--base-white);
  font-family: var(--font-family-base);
  cursor: pointer;
  transition: filter 150ms ease;
}
.host-del__btn:hover { filter: brightness(0.94); }
.host-del__btn:focus-visible { outline: var(--focus-ring-width) solid var(--color-host-danger); outline-offset: var(--focus-ring-offset); }
</style>
