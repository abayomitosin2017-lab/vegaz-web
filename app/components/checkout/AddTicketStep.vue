<script setup lang="ts">
/**
 * "Add Ticket — Add extra ticket tier to your cart" (Figma Desktop 61 /
 * iPhone 22). Ticket Type select listing the event's types not yet in the
 * cart: sold out ones greyed with a "Sold out" chip; low stock with a red
 * "N tickets left" chip. Back / Add to cart (active once a type is chosen;
 * adds one ticket of that type and returns to the cart).
 */
import type { TicketType } from '~/types/ticket'
import type { SelectOption } from './Select.vue'
import { formatNaira } from '~/utils/money'

const props = defineProps<{ titleId: string; tickets: TicketType[] }>()
const emit = defineEmits<{ close: []; back: []; add: [ticketId: string] }>()

const choice = ref<string | null>(null)
const options = computed<SelectOption[]>(() => props.tickets.map(t => ({
  id: t.id,
  label: t.name,
  description: t.description,
  value: t.price ? formatNaira(t.price) : 'Free',
  chip: t.availability === 'sold-out' ? 'Sold out' : t.availability === 'low' ? t.availabilityLabel : undefined,
  chipTone: t.availability === 'low' ? 'alert' : 'neutral',
  disabled: t.availability === 'sold-out',
})))
</script>

<template>
  <div class="checkout-step">
    <CheckoutHeader :title-id="titleId" title="Add Ticket" subtitle="Add extra ticket tier to your cart" @close="emit('close')" />
    <CheckoutSelect v-model="choice" :options="options" label="Ticket Type" placeholder="Select Type" />
    <div class="checkout-actions">
      <UiButton color="secondary" @click="emit('back')">Back</UiButton>
      <UiButton :color="choice ? 'primary' : 'secondary'" :aria-disabled="!choice ? 'true' : undefined" @click="choice && emit('add', choice)">Add to cart</UiButton>
    </div>
  </div>
</template>
