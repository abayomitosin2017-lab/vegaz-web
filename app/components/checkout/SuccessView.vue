<script setup lang="ts">
/**
 * "Your ticket is on its way..." (Figma Desktop 63 / iPhone 13 mini 155).
 * Rendered inside UiModal (purple card on desktop, full screen on phones).
 *
 * Desktop: Primary card, radius 40, 24px padding, 479px wide. Close: 36px
 * #1E0440 circle with a light 20px X, top right. Three photos (69px, 4px
 * white edge, radius 12, soft shadow; outer two tilted -29 / 28 degrees,
 * overlapping by 9px). Title Headline 1 bold 32/40 -1 #FFFDF6; copy Small
 * semibold #E3CFFC; centred, 12px apart; 40px under the photos. 32px below:
 * "Join Chat with Others" (secondary button, full width).
 * Phones: full purple screen: light Vegaz logo top left, close top right,
 * content centred (330px), buttons "Join Chat with Others" (white) and
 * "Close" (text only; was "Cancel", decision 27 Oct: it only closes this
 * screen, back to the event page), 8px apart; a soft dark glow at the bottom.
 *
 * Photos: the event's own photos (flier first), not Figma's sample images.
 * Copy (decision 22 Oct): "it's way" -> "its way", "hangout chat" ->
 * "event chat".
 */
const props = defineProps<{ titleId: string; photos: string[]; busy?: boolean }>()
const emit = defineEmits<{ close: []; join: [] }>()

const shown = computed(() => [0, 1, 2].map(i => props.photos[i] ?? props.photos[0]).filter((p): p is string => !!p))
</script>

<template>
  <div class="checkout-success">
    <img class="checkout-success__glow" src="/images/checkout/success-glow.svg" alt="" aria-hidden="true" />
    <div class="checkout-success__top">
      <img class="checkout-success__logo" src="/images/checkout/logo-light.svg" alt="Vegaz" width="75" height="32" />
      <button type="button" class="checkout-success__close" aria-label="Close" @click="emit('close')">
        <img src="/images/checkout/icon-close-light-20.svg" alt="" width="16" height="16" />
      </button>
    </div>

    <div class="checkout-success__body">
      <div class="checkout-success__photos" aria-hidden="true">
        <span v-for="(src, i) in shown" :key="i" :class="['checkout-success__photo', `checkout-success__photo--${i}`]">
          <img :src="src" alt="" />
        </span>
      </div>
      <div class="checkout-success__text">
        <h2 :id="titleId" class="checkout-success__title text-app-h1-bold">Your ticket is on its way...</h2>
        <p class="checkout-success__copy text-app-small-semibold">Get ready for an awesome experience! Your ticket will be zooming into your mail, but don’t forget to hop into the event chat and connect with fellow guests.</p>
      </div>
    </div>

    <div class="checkout-success__actions">
      <UiButton class="checkout-success__join" color="secondary" data-autofocus :aria-busy="busy ? 'true' : undefined" @click="!busy && emit('join')">Join Chat with Others</UiButton>
      <UiButton class="checkout-success__cancel" color="secondary" fill="ghost" @click="emit('close')">Close</UiButton><!-- text only (decision 27 Oct; was outlined) -->
    </div>
  </div>
</template>

<style scoped>
.checkout-success {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  color: var(--color-success-title);
}
.checkout-success__glow { display: none; }
.checkout-success__top { display: flex; align-items: center; justify-content: flex-end; }
.checkout-success__logo { display: none; }
.checkout-success__close {
  display: inline-flex;
  padding: var(--spacing-xs);
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-success-close);
  cursor: pointer;
}
.checkout-success__close:focus-visible { outline: var(--focus-ring-width) solid var(--color-success-title); outline-offset: var(--focus-ring-offset); }

.checkout-success__body { display: flex; flex-direction: column; gap: var(--spacing-2xl); margin-top: calc(var(--spacing-md) - var(--spacing-xl)); }
.checkout-success__photos { display: flex; align-items: center; justify-content: center; height: 94px; }
.checkout-success__photo {
  position: relative;
  flex: none;
  width: 69px;
  height: 69px;
  overflow: hidden;
  border: 4px solid var(--base-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-success-photo);
  background: var(--color-placeholder-media);
}
.checkout-success__photo + .checkout-success__photo { margin-left: -9px; }
.checkout-success__photo--0 { transform: rotate(-28.95deg); margin-right: 3px; }
.checkout-success__photo--1 { z-index: 1; }
.checkout-success__photo--2 { transform: rotate(28.24deg); margin-left: -6px !important; }
.checkout-success__photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.checkout-success__text { display: flex; flex-direction: column; gap: var(--spacing-sm); text-align: center; }
.checkout-success__title { margin: 0; color: var(--color-success-title); }
.checkout-success__copy { margin: 0; color: var(--color-success-copy); }

.checkout-success__actions { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.checkout-success__actions .checkout-success__join.ui-button { width: 100%; }
.checkout-success__actions .checkout-success__cancel.ui-button { display: none; }

/* Phones: full screen */
@media (max-width: 767px) {
  .checkout-success {
    min-height: 100dvh;
    padding: calc(36px + env(safe-area-inset-top, 0px)) var(--spacing-lg) calc(var(--spacing-2xl) + env(safe-area-inset-bottom, 0px));
    overflow: hidden;
    gap: 0;
  }
  .checkout-success__glow { display: block; position: absolute; left: 50%; bottom: 0; z-index: -1; width: 100%; max-width: 375px; height: auto; transform: translateX(-50%); pointer-events: none; }
  .checkout-success__top { justify-content: space-between; }
  .checkout-success__logo { display: block; }
  .checkout-success__body { width: min(330px, 100%); margin: 99px auto 0; } /* Figma: content 214px from the top */
  .checkout-success__actions { width: min(330px, 100%); margin: var(--spacing-xl) auto 0; }
  .checkout-success__actions .checkout-success__join.ui-button.ui-button--solid { --btn-bg: var(--base-white); --btn-border: var(--base-white); --btn-fg: var(--base-black); }
  .checkout-success__actions .checkout-success__cancel.ui-button {
    display: inline-flex;
    width: 100%;
    --btn-bg: transparent;
    --btn-bg-hover: var(--color-success-close);
    --btn-fg: var(--base-white);
    --ui-button-border-color: transparent; /* text only (decision 27 Oct) */
  }
}
</style>
