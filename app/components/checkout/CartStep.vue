<script setup lang="ts">
/**
 * "Ticket Cart — Where you can add tickets you would like to buy"
 * (Figma Desktop 60 / iPhone 21).
 *
 * One dashed card per ticket type in the cart (1px Grey_5 dashed, radius 16,
 * 16px padding, 8px apart): ticket icon, name (Body regular) over price
 * (Body semibold), and the "- n +" stepper. "+ Add New Ticket" (x-Small
 * semibold Primary, Inter in Figma; Outfit here like the rest of the UI)
 * opens Add Ticket; hidden when every type is already in the cart. Total
 * Amount row: Grey_6, radius 9, 16px padding, Small regular / Small bold.
 * Back / Checkout.
 *
 * Decisions 22 Oct: the cart and the page share the same picks (changing a
 * number here changes the page too); the total is the real sum (Figma's
 * ₦11,000 was placeholder). A type set to 0 stays in the cart until the
 * cart closes, so it does not jump away while tapping. Checkout is inactive
 * with 0 tickets.
 */
import type { TicketType } from '~/types/ticket'
import { formatNaira } from '~/utils/money'

const props = defineProps<{ titleId: string; tickets: TicketType[]; lines: string[]; total: number; count: number; canAdd: boolean; free?: boolean }>()
const quantities = defineModel<Record<string, number>>('quantities', { required: true })
const emit = defineEmits<{ close: []; back: []; add: []; checkout: [] }>()

const rows = computed(() => props.lines.map(id => props.tickets.find(t => t.id === id)).filter((t): t is TicketType => !!t))
const max = (t: TicketType) => (t.availability === 'sold-out' ? 0 : t.maxQuantity)
</script>

<template>
  <div class="checkout-step">
    <CheckoutHeader :title-id="titleId" title="Ticket Cart" subtitle="Where you can add tickets you would like to buy" @close="emit('close')" />

    <div class="checkout-cart">
      <ul class="checkout-cart__list">
        <li v-for="t in rows" :key="t.id" class="checkout-cart__line">
          <img src="/images/checkout/icon-ticket-24.svg" alt="" width="24" height="24" />
          <span class="checkout-cart__text">
            <span class="checkout-cart__name text-app-body-regular">{{ t.name }}</span>
            <span class="checkout-cart__price text-app-body-semibold">{{ t.price ? formatNaira(t.price) : 'Free' }}</span>
          </span>
          <UiQuantityStepper :model-value="quantities[t.id] ?? 0" class="checkout-cart__stepper" :max="max(t)" :unavailable="t.availability === 'sold-out' && !quantities[t.id]" :label="`${t.name} tickets`" @update:model-value="quantities[t.id] = $event" />
        </li>
      </ul>
      <button v-if="canAdd" type="button" class="checkout-link text-app-xsmall-semibold" @click="emit('add')">
        <img src="/images/checkout/icon-add-16.svg" alt="" width="16" height="16" />
        Add New Ticket
      </button>
    </div>

    <div class="checkout-total">
      <span class="text-app-small-regular">Total Amount</span>
      <span class="text-app-small-bold">{{ formatNaira(total) }}</span>
    </div>

    <div class="checkout-actions">
      <UiButton color="secondary" @click="emit('back')">Back</UiButton>
      <UiButton :color="count ? 'primary' : 'secondary'" :aria-disabled="!count ? 'true' : undefined" @click="count && emit('checkout')">{{ free ? 'RSVP' : 'Checkout' }}</UiButton>
    </div>
  </div>
</template>

<style scoped>
.checkout-cart { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.checkout-cart__list { display: flex; flex-direction: column; gap: var(--spacing-xs); margin: 0; padding: 0; list-style: none; }
.checkout-cart__line {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: calc(var(--spacing-md) - var(--border-width-default));
  border: var(--border-width-default) dashed var(--color-border-default);
  border-radius: var(--spacing-md); /* Figma radius 16: no radius token */
  background: var(--color-background-primary);
}
.checkout-cart__line > img { flex: none; }
.checkout-cart__text { display: flex; flex: 1 1 auto; flex-direction: column; gap: var(--spacing-xxs); min-width: 0; color: var(--color-text-checkout); }
.checkout-cart__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* Figma cart stepper hugs its content (138px) */
.checkout-cart__line .checkout-cart__stepper { width: 138px; }
</style>
