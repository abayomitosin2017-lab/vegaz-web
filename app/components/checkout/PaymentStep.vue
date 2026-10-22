<script setup lang="ts">
/**
 * Payment. Figma shows only a "PAYSTACK FLOW" placeholder box (Desktop 62 /
 * iPhone 24). Decision 22 Oct: a mock step for the demo.
 * NOT IN FIGMA (proposed): title "Pay with Paystack", the order total in the
 * cart's Total Amount style, a note that the demo takes no money, and
 * Back / "Pay ₦X". Engineering replaces this step with the real Paystack
 * checkout (see services/checkout.ts).
 */
import { formatNaira } from '~/utils/money'

defineProps<{ titleId: string; eventTitle: string; total: number; count: number; busy?: boolean }>()
const emit = defineEmits<{ close: []; back: []; pay: [] }>()
</script>

<template>
  <div class="checkout-step">
    <CheckoutHeader :title-id="titleId" title="Pay with Paystack" :subtitle="eventTitle" @close="emit('close')" />
    <div class="checkout-pay">
      <div class="checkout-total">
        <span class="text-app-small-regular">{{ count }} {{ count === 1 ? 'ticket' : 'tickets' }}</span>
        <span class="text-app-small-bold">{{ formatNaira(total) }}</span>
      </div>
      <p class="checkout-pay__note text-app-xsmall-regular">Demo payment: no money is taken. The real Paystack checkout opens here.</p>
    </div>
    <div class="checkout-actions">
      <UiButton color="secondary" @click="emit('back')">Back</UiButton>
      <UiButton data-autofocus :aria-disabled="busy ? 'true' : undefined" :aria-busy="busy ? 'true' : undefined" @click="!busy && emit('pay')">Pay {{ formatNaira(total) }}</UiButton>
    </div>
  </div>
</template>

<style scoped>
.checkout-pay { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.checkout-pay__note { margin: 0; color: var(--color-text-secondary); text-align: center; }
</style>
