<script setup lang="ts">
/**
 * CheckoutHeader: title, one line under it and the close button, as on every
 * buy ticket step (Figma 10713:56670).
 *
 * Title: Headline 2 Mobile App bold, 24/32, -0.5, #141316.
 * Line under it: Small Mobile App regular 14/20, Grey_2; 4px below the title.
 * Close: two Figma styles, kept as designed:
 *   'small' (Buy Ticket, details, cart, add ticket): 16px thin X, top right
 *   'sheet' (Assign tickets, Add user): 24px bold X centred on the title
 */
withDefaults(defineProps<{ title: string; subtitle?: string; titleId: string; close?: 'small' | 'sheet' }>(), { subtitle: undefined, close: 'small' })
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div :class="['checkout-head', `checkout-head--${close}`]">
    <div class="checkout-head__text">
      <h2 :id="titleId" class="checkout-head__title text-app-h2-bold">{{ title }}</h2>
      <p v-if="subtitle" class="checkout-head__sub text-app-small-regular">{{ subtitle }}</p>
    </div>
    <button type="button" class="checkout-head__close" aria-label="Close" @click="emit('close')">
      <img v-if="close === 'small'" src="/images/checkout/icon-close-16.svg" alt="" width="16" height="16" />
      <img v-else src="/images/checkout/icon-close-sheet-24.svg" alt="" width="24" height="24" />
    </button>
  </div>
</template>

<style scoped>
.checkout-head { display: flex; align-items: flex-start; gap: var(--spacing-xs); width: 100%; }
.checkout-head__text { display: flex; flex: 1 1 auto; flex-direction: column; gap: var(--spacing-xxs); min-width: 0; }
.checkout-head__title { margin: 0; color: var(--color-text-checkout); }
.checkout-head__sub { margin: 0; color: var(--color-text-secondary); }
/* Tap area enlarged to 32px without moving the icon */
.checkout-head__close {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  margin: calc(-1 * var(--spacing-xs)) calc(-1 * var(--spacing-xs)) 0 0;
  padding: var(--spacing-xs);
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}
.checkout-head--sheet .checkout-head__close { margin: 0 calc(-1 * var(--spacing-xxs)) 0 0; padding: var(--spacing-xxs); }
.checkout-head__close:hover { background: var(--color-background-secondary); } /* proposed */
.checkout-head__close:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 0; }
</style>
