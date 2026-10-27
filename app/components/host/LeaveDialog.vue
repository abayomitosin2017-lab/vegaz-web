<script setup lang="ts">
/**
 * "Leave without publishing?" (decision 27 Oct; NOT IN FIGMA, PROPOSED copy
 * and layout, same frame as the Log out dialog). The text names the event
 * when a title has been typed ("“Sunday Brunch” isn't live yet…"). Opens when someone tries to
 * leave Create event / New edition after starting it (Exit, Back on the
 * first step, the browser's back button...). Their draft is not saved
 * anywhere yet, so leaving loses it.
 * - "Leave and delete" (Negative red): leaves and drops the draft.
 * - "Keep editing" (text only; focused first so a stray Enter keeps them in).
 * X, Escape or clicking outside also keep them in the flow.
 */
const props = defineProps<{ open: boolean; /** Event title typed so far, if any */ title?: string; edition?: boolean }>()
const emit = defineEmits<{ stay: []; leave: [] }>()
const id = useId()
const name = computed(() => props.title?.trim() ? `“${props.title.trim()}”` : props.edition ? 'Your new edition' : 'Your event')
</script>

<template>
  <UiModal :open="open" :width="375" phone="sheet" :labelledby="`${id}-t`" card-class="host-leave-card" @close="emit('stay')">
    <div class="host-leave">
      <button type="button" class="host-leave__close" aria-label="Close" @click="emit('stay')">
        <img src="/images/host/icon-close-16.svg" alt="" width="16" height="16" />
      </button>
      <div class="host-leave__body">
        <div class="host-leave__text">
          <h2 :id="`${id}-t`" class="host-leave__title">Leave without publishing?</h2>
          <p class="host-leave__copy">{{ name }} isn't live yet and drafts aren't saved. If you leave now, the details, photos and tickets you've added will be deleted.</p>
        </div>
        <div class="host-leave__actions">
          <UiButton class="host-leave__yes" @click="emit('leave')">Leave and delete</UiButton>
          <UiButton color="secondary" fill="ghost" data-autofocus @click="emit('stay')">Keep editing</UiButton><!-- text only (decision 27 Oct) -->
        </div>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.host-leave { display: flex; flex-direction: column; align-items: flex-end; gap: var(--spacing-xs); }
.host-leave__close { display: inline-flex; padding: 0; border: 0; background: none; border-radius: var(--radius-pill); cursor: pointer; }
.host-leave__close:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.host-leave__body { align-self: stretch; display: flex; flex-direction: column; gap: var(--spacing-2xl); }
.host-leave__text { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.host-leave__title {
  margin: 0;
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  font-weight: var(--text-modal-title-weight); font-size: var(--text-modal-title-size); line-height: var(--text-modal-title-line); letter-spacing: var(--text-modal-title-tracking);
}
.host-leave__copy {
  margin: 0;
  color: var(--color-text-secondary);
  font-family: var(--font-family-base);
  font-weight: var(--text-app-body-regular-weight); font-size: var(--text-app-body-regular-size); line-height: var(--text-app-body-regular-line); letter-spacing: var(--text-app-body-regular-tracking);
}
.host-leave__actions { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.host-leave__actions .ui-button { width: 100%; }
.host-leave__yes.ui-button {
  --btn-bg: var(--base-negative);
  --btn-border: var(--base-negative);
  --btn-fg: var(--base-white);
  --btn-bg-hover: color-mix(in srgb, var(--base-negative) 90%, #000);
  --btn-bg-active: color-mix(in srgb, var(--base-negative) 82%, #000);
}
.host-leave__yes.ui-button:focus-visible { outline-color: var(--base-negative); }
</style>

<style>
.ui-modal .ui-modal__card.host-leave-card.host-leave-card { padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-2xl); }
</style>
