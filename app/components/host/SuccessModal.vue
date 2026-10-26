<script setup lang="ts">
import './styles.css'
import { eventUrl, useShareLink } from '~/composables/useShareLink'
/**
 * "Event Created" (Figma frame 20), shown over the new event's page like
 * the buy-ticket success (decision 23 Oct). Primary card 479px, radius 40,
 * padding 24; 36px dark close circle top right; 40px below: "Event
 * Created" (H1 app bold 32/40 #FFFDF6) and "Your event is live, get your
 * people to join you" (Small app semibold #E3CFFC), 12 apart; 32px below:
 * invite card (white, radius 20, 16 padding, soft shadow): "Invite others
 * to join this event" (Body app semibold) and the link box (1px Grey_5,
 * radius 16, 12 padding) with "Copy" and QR pills (Grey_5); then "Share
 * Event" (secondary) and "Go to event" (outline, Grey_2 line, light text),
 * 16 apart, full width.
 * "Go to event" closes the dialog (the event page is already behind it).
 * OPEN ITEM: the QR code (not designed beyond the button) — the button
 * shows a short note for now.
 */
const props = defineProps<{ open: boolean; eventId: string; title: string }>()
const emit = defineEmits<{ close: [] }>()
const { toast, share, copy } = useShareLink()
const id = useId()

const link = computed(() => (import.meta.client && props.eventId ? eventUrl(props.eventId) : ''))
</script>

<template>
  <UiModal :open="open" :width="479" phone="fullscreen" card-class="host-success-card" :labelledby="`${id}-t`" @close="emit('close')">
    <div class="host-success">
      <div class="host-success__top">
        <button type="button" class="host-success__close" aria-label="Close" @click="emit('close')">
          <img src="/images/host/icon-close-success-36.svg" alt="" width="36" height="36" />
        </button>
      </div>
      <div class="host-success__text">
        <h2 :id="`${id}-t`" class="host-success__title text-app-h1-bold">Event Created</h2>
        <p class="host-success__copy text-app-small-semibold">Your event is live, get your people to join you</p>
      </div>
      <div class="host-success__invite">
        <p class="host-success__invite-title text-app-body-semibold">Invite others to join this event</p>
        <div class="host-success__link">
          <span class="host-success__url text-app-small-semibold">{{ link }}</span>
          <button type="button" class="host-success__pill text-app-xsmall-semibold" @click="copy(link, 'Link copied')">
            <img src="/images/host/icon-copy-16.svg" alt="" width="16" height="16" />Copy
          </button>
          <button type="button" class="host-success__pill host-success__pill--icon" aria-label="Show QR code" @click="toast = 'QR code is coming soon'">
            <img src="/images/host/icon-qr-18.svg" alt="" width="18" height="18" />
          </button>
        </div>
      </div>
      <div class="host-success__actions">
        <UiButton color="secondary" data-autofocus @click="share({ url: link, title: props.title })">Share Event</UiButton>
        <UiButton class="host-success__go" color="secondary" fill="outline" @click="emit('close')">Go to event</UiButton>
      </div>
    </div>
    <UiToast :message="toast" @done="toast = ''" />
  </UiModal>
</template>

<style scoped>
.host-success { display: flex; flex-direction: column; gap: var(--spacing-xl); color: var(--color-success-title); }
.host-success__top { display: flex; justify-content: flex-end; margin-bottom: var(--spacing-xs); /* 40 to the title */ }
.host-success__close { display: inline-flex; padding: 0; border: 0; border-radius: 50%; background: none; cursor: pointer; }
.host-success__close:focus-visible { outline: var(--focus-ring-width) solid var(--color-success-title); outline-offset: var(--focus-ring-offset); }
.host-success__text { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.host-success__title { margin: 0; color: var(--color-success-title); }
.host-success__copy { margin: 0; color: var(--color-success-copy); }
.host-success__invite {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: 20px;
  background: var(--color-background-primary);
  box-shadow: 0 4px 40px rgba(0, 0, 0, 0.08);
}
.host-success__invite-title { margin: 0; color: var(--color-text-checkout); }
.host-success__link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xxs);
  padding: var(--spacing-sm);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: 16px;
}
.host-success__url { flex: 1; min-width: 0; margin-right: var(--spacing-sm); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-text-strong); }
.host-success__pill {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  height: 30px;
  padding: 6px var(--spacing-xs);
  border: 0;
  border-radius: 30px;
  background: var(--color-border-default);
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  cursor: pointer;
}
.host-success__pill--icon { padding: 6px; }
.host-success__pill:hover { background: var(--color-border-strong); }
.host-success__pill:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 1px; }
.host-success__actions { display: flex; flex-direction: column; gap: var(--spacing-md); }
.host-success__actions .ui-button { width: 100%; }
.host-success__go.ui-button {
  --ui-button-border-color: var(--color-text-secondary);
  --btn-fg: var(--color-background-secondary);
  --btn-bg-hover: var(--color-success-close);
  --btn-bg-active: var(--color-success-close);
}

@media (max-width: 767px) {
  .host-success { min-height: 100dvh; box-sizing: border-box; justify-content: center; padding: var(--spacing-lg); }
  .host-success__top { position: absolute; top: calc(var(--spacing-lg) + env(safe-area-inset-top, 0px)); right: var(--spacing-lg); }
}
</style>
