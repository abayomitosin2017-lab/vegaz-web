<script setup lang="ts">
import './styles.css'
import { eventUrl, useShareLink } from '~/composables/useShareLink'
/**
 * "Event Created", shown over the new event's page.
 *
 * One design for phones and the web (decision 26 Oct): the white mobile
 * frame (Figma "create event" 10754:74140). Confetti at the top, green check
 * circle, "Event Created" (H1 app bold Black), subtext (Small app regular
 * Grey_3), invite card (white, radius 20, soft shadow) with the link, "Copy"
 * and QR pills, then "Share Event" (Primary) and "Go to event" (secondary),
 * 8 apart.
 * Phones: full screen, buttons at the bottom. Web: a 479px white card with
 * a 16px close (X) at the top right; the same content, centred.
 *
 * The subtext also tells the host to continue in the Vegaz app for
 * advanced settings and moderation (your copy, PROPOSED wording; no
 * download button). "Go to event" and X close it and show the event page.
 * OPEN ITEM: QR code (only a note for now).
 */
const props = defineProps<{ open: boolean; eventId: string; title: string }>()
const emit = defineEmits<{ close: [] }>()
const { toast, share, copy } = useShareLink()
const id = useId()

const link = computed(() => (import.meta.client && props.eventId ? eventUrl(props.eventId) : ''))
</script>

<template>
  <UiModal :open="open" :width="479" phone="fullscreen" card-class="host-success-card" :dismissible="false" :labelledby="`${id}-t`" @close="emit('close')">
    <div class="host-success">
      <img class="host-success__confetti" src="/images/host/m-confetti.svg" alt="" aria-hidden="true" width="402" height="244" />
      <button type="button" class="host-success__close" aria-label="Close" @click="emit('close')">
        <img src="/images/host/icon-close-16.svg" alt="" width="16" height="16" />
      </button>
      <div class="host-success__hero">
        <span class="host-success__check" aria-hidden="true"><img src="/images/host/m-check-circle.svg" alt="" width="164" height="164" /></span>
        <div class="host-success__text">
          <h2 :id="`${id}-t`" class="host-success__title text-app-h1-bold">Event Created</h2>
          <p :id="`${id}-c`" class="host-success__copy text-app-small-regular">
            Your event is live. Share the link below to invite people. To manage settings and moderate your event, download the Vegaz app.
          </p>
        </div>
      </div>
      <div class="host-success__invite">
        <p class="host-success__invite-title text-app-body-semibold">Invite others to join this event</p>
        <div class="host-success__link">
          <span class="host-success__url text-app-small-semibold">{{ link }}</span>
          <button type="button" class="host-success__pill text-app-xsmall-semibold" @click="copy(link, 'Link copied')">
            <img src="/images/host/icon-copy-16.svg" alt="" width="16" height="16" />Copy
          </button>
          <button type="button" class="host-success__pill host-success__pill--icon" aria-label="Show QR code" @click="toast = 'QR code is coming soon'">
            <img src="/images/host/icon-qr-18.svg" alt="" width="16" height="16" />
          </button>
        </div>
      </div>
      <div class="host-success__actions">
        <UiButton class="host-success__share" data-autofocus @click="share({ url: link, title: props.title })">Share Event</UiButton>
        <UiButton class="host-success__go" color="secondary" @click="emit('close')">Go to event</UiButton>
      </div>
    </div>
    <UiToast :message="toast" @done="toast = ''" />
  </UiModal>
</template>

<style scoped>
/* Web: white card. Phones: full screen, content top, buttons at the bottom */
.host-success {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-3xl) var(--spacing-lg) var(--spacing-lg);
  overflow: hidden;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  text-align: center;
}
.host-success__confetti { position: absolute; top: 0; left: 50%; width: 402px; max-width: none; height: auto; transform: translateX(-50%); pointer-events: none; }
.host-success__close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 1;
  display: inline-flex;
  padding: var(--spacing-xs);
  border: 0;
  border-radius: 50%;
  background: var(--color-background-secondary);
  cursor: pointer;
}
.host-success__close:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.host-success__hero { position: relative; display: flex; flex-direction: column; align-items: center; gap: 29px; }
.host-success__check { display: block; position: relative; width: 100px; height: 100px; flex: none; }
.host-success__check img { position: absolute; left: -31.67px; top: -20.67px; width: 164px; height: 164px; max-width: none; }
.host-success__text { display: flex; flex-direction: column; gap: var(--spacing-xs); max-width: 340px; }
.host-success__title { margin: 0; color: var(--color-text-primary); }
.host-success__copy { margin: 0; color: var(--color-text-muted); }
.host-success__invite {
  box-sizing: border-box;
  width: min(360px, 100%);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: 20px;
  background: var(--color-background-primary);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
.host-success__invite-title { margin: 0; color: var(--color-text-checkout); }
.host-success__link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xxs);
  padding: calc(var(--spacing-sm) - 1px);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: 16px;
  text-align: left;
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
.host-success__actions { box-sizing: border-box; width: min(360px, 100%); display: flex; flex-direction: column; gap: var(--spacing-xs); }
.host-success__actions .ui-button { width: 100%; }

@media (max-width: 767px) {
  .host-success {
    box-sizing: border-box;
    min-height: 100dvh;
    gap: 0;
    padding: calc(var(--spacing-4xl) + 40px + env(safe-area-inset-top, 0px)) var(--spacing-lg) calc(var(--spacing-2xl) + env(safe-area-inset-bottom, 0px));
  }
  .host-success__close { display: none; } /* not in the mobile frame; "Go to event" closes */
  .host-success__invite { margin-top: var(--spacing-4xl); }
  /* buttons sit at the bottom of the screen */
  .host-success__actions { margin-top: auto; padding-top: var(--spacing-2xl); }
}
</style>
