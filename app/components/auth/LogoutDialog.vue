<script setup lang="ts">
/**
 * Log out confirmation (Figma 10834:26385), opened from the profile menu's
 * "Log out".
 *
 * White card 375px, radius 24, padding 24 / 24 / 40. 16px close (X) at the
 * top right, 8px above the content. Content 40 apart:
 *  - 40px "Logout 3" icon (Grey_3) over the text, 16 apart;
 *  - "Already Leaving?" (Headline 2 mobile bold 24/32, -0.5, Grey_1) and
 *    the explanation (Body mobile regular 16/24, #141316), 8 apart;
 *  - buttons full width, 8 apart: "Yes, Log out" (Negative #FF3B2D, white
 *    Body semibold) and "No, take me back!" (secondary: Grey_6 fill,
 *    Grey_5 line, Grey_1 text).
 * Phones: the same centred card (the frame is a card, not a sheet), capped
 * by the 20px side margin.
 * "Yes, Log out" signs out; "No, take me back!", X, Escape and clicking
 * outside just close it. Focus starts on "No, take me back!" so a stray
 * Enter doesn't log anyone out (PROPOSED).
 */
defineProps<{ open: boolean; busy?: boolean }>()
const emit = defineEmits<{ close: []; confirm: [] }>()
const id = useId()
</script>

<template>
  <UiModal :open="open" :width="375" :dismissible="!busy" :labelledby="`${id}-t`" card-class="auth-logout-card" @close="emit('close')">
    <div class="auth-logout">
      <button type="button" class="auth-logout__close" aria-label="Close" @click="emit('close')">
        <img src="/images/host/icon-close-16.svg" alt="" width="16" height="16" />
      </button>
      <div class="auth-logout__body">
        <div class="auth-logout__head">
          <img class="auth-logout__icon" src="/images/auth/icon-logout-40.svg" alt="" width="40" height="40" />
          <div class="auth-logout__text">
            <h2 :id="`${id}-t`" class="auth-logout__title">Already Leaving?</h2>
            <p class="auth-logout__copy">You are about to log out of your account and authentication will be required to log back in</p>
          </div>
        </div>
        <div class="auth-logout__actions">
          <UiButton class="auth-logout__yes" :aria-disabled="busy ? 'true' : undefined" @click="!busy && emit('confirm')">
            {{ busy ? 'Logging out…' : 'Yes, Log out' }}
          </UiButton>
          <UiButton class="auth-logout__no" color="secondary" data-autofocus @click="emit('close')">No, take me back!</UiButton>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.auth-logout { display: flex; flex-direction: column; align-items: flex-end; gap: var(--spacing-xs); }
.auth-logout__close { display: inline-flex; padding: 0; border: 0; background: none; border-radius: var(--radius-pill); cursor: pointer; }
.auth-logout__close:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.auth-logout__body { align-self: stretch; display: flex; flex-direction: column; gap: var(--spacing-2xl); }
.auth-logout__head { display: flex; flex-direction: column; align-items: flex-start; gap: var(--spacing-md); }
.auth-logout__icon { display: block; width: 40px; height: 40px; }
.auth-logout__text { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.auth-logout__title {
  margin: 0;
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  font-weight: var(--text-modal-title-weight); font-size: var(--text-modal-title-size); line-height: var(--text-modal-title-line); letter-spacing: var(--text-modal-title-tracking);
}
.auth-logout__copy {
  margin: 0;
  color: var(--color-text-checkout);
  font-family: var(--font-family-base);
  font-weight: var(--text-app-body-regular-weight); font-size: var(--text-app-body-regular-size); line-height: var(--text-app-body-regular-line); letter-spacing: var(--text-app-body-regular-tracking);
}
.auth-logout__actions { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.auth-logout__actions .ui-button { width: 100%; }
/* Figma "Base-color/Negative"; hover/pressed slightly darker (not drawn) */
.auth-logout__yes.ui-button {
  --btn-bg: var(--base-negative);
  --btn-border: var(--base-negative);
  --btn-fg: var(--base-white);
  --btn-bg-hover: color-mix(in srgb, var(--base-negative) 90%, #000);
  --btn-bg-active: color-mix(in srgb, var(--base-negative) 82%, #000);
}
.auth-logout__yes.ui-button:focus-visible { outline-color: var(--base-negative); }
</style>

<style>
/* Card padding from the frame: 24 / 24 / 40 (all widths) */
.ui-modal .ui-modal__card.auth-logout-card.auth-logout-card { padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-2xl); }
</style>
