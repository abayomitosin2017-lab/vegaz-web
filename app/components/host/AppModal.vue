<script setup lang="ts">
/**
 * "Unlock your host tools in the app" (decision 27 Oct; not in Figma,
 * PROPOSED layout from the Log out dialog: 375 card, radius 24, padding
 * 24 / 24 / 40, close X top right).
 * Shown to the HOST of an event each time they open its page (after the
 * "Event Created" dialog on the first visit). "Maybe Later", X, Escape or
 * clicking outside close it until their next visit. Guests never see it.
 * - Image: the app on a phone (supplied by design 27 Oct) on a Grey_6 panel,
 *   radius 16, phone sitting on the panel's bottom edge.
 * - Title (modal title style) and one sentence (app body regular, Grey_2),
 *   both centred.
 * - "Open the Vegaz app" (primary, full width): opens the app or its store
 *   page (config/app.ts, placeholder link, OPEN ITEM).
 * - "Maybe Later" (text only, full width; decision 27 Oct): closes it for now.
 * - Title: app H2 24/32 bold (decision 27 Oct).
 * Copy PROPOSED, design / product to confirm.
 */
import { openAppUrl } from '~/config/app'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const id = useId()

function openApp() {
  if (openAppUrl !== '#') window.open(openAppUrl, '_blank', 'noopener')
  emit('close')
}
</script>

<template>
  <UiModal :open="open" :width="375" :labelledby="`${id}-t`" card-class="host-app-card" @close="emit('close')">
    <div class="host-app">
      <button type="button" class="host-app__close" aria-label="Close" @click="emit('close')">
        <img src="/images/host/icon-close-16.svg" alt="" width="16" height="16" />
      </button>
      <div class="host-app__body">
        <div class="host-app__art" aria-hidden="true">
          <img src="/images/host/app-phone.png" alt="" width="564" height="598" />
        </div>
        <div class="host-app__text">
          <h2 :id="`${id}-t`" class="host-app__title">Unlock your host tools in the app</h2>
          <p class="host-app__copy">Get your guest and promoter links, scan tickets at the door and manage your event, all in the Vegaz app.</p>
        </div>
        <div class="host-app__actions">
          <UiButton data-autofocus @click="openApp">Open the Vegaz app</UiButton>
          <UiButton color="secondary" fill="ghost" @click="emit('close')">Maybe Later</UiButton><!-- text only (decision 27 Oct) -->
        </div>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.host-app { display: flex; flex-direction: column; align-items: flex-end; gap: var(--spacing-xs); }
.host-app__close { display: inline-flex; padding: 0; border: 0; background: none; border-radius: var(--radius-pill); cursor: pointer; }
.host-app__close:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.host-app__body { align-self: stretch; display: flex; flex-direction: column; gap: var(--spacing-lg); }
.host-app__art {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 200px;
  padding-top: var(--spacing-md);
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-background-secondary);
}
.host-app__art img { display: block; width: auto; height: 100%; }
.host-app__text { display: flex; flex-direction: column; gap: var(--spacing-xs); text-align: center; } /* centred (decision 27 Oct) */
.host-app__title {
  margin: 0;
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-bold); font-size: 24px; line-height: 32px; letter-spacing: -0.5px; /* app H2 24/32 bold (decision 27 Oct) */
  text-wrap: balance; /* no single word left on the last line */
}
.host-app__copy {
  margin: 0;
  color: var(--color-text-secondary); /* body Grey_2 (decision 27 Oct) */
  font-family: var(--font-family-base);
  font-weight: var(--text-app-body-regular-weight); font-size: var(--text-app-body-regular-size); line-height: var(--text-app-body-regular-line); letter-spacing: var(--text-app-body-regular-tracking);
}
.host-app__actions { display: flex; flex-direction: column; gap: var(--spacing-xs); margin-top: var(--spacing-xs); }
.host-app__actions .ui-button { width: 100%; }
</style>

<style>
.ui-modal .ui-modal__card.host-app-card.host-app-card { padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-2xl); }
</style>
