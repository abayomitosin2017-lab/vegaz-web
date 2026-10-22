<script setup lang="ts">
/**
 * EventTicketPanel: the ticket picker (Figma event details, right column on
 * desktop; under the host tag on phones and tablets).
 *
 * Desktop: white card, 1px Grey_5 line, radius 32, 16px padding; ticket cards
 * (TicketOption, Figma Component 13) 16px apart; 20px below them the
 * "Buy Ticket (₦520,000)" primary button, full width.
 * Phones/tablets (Figma phone frame): no card or button; just the ticket
 * cards. The bottom bar (EventTicketBar) shows the total and Buy Ticket.
 *
 * Totals (decision 22 Oct): total = price x quantity for every type.
 * Buy Ticket has no action yet (decision 22 Oct; checkout not designed).
 * Not in Figma (proposed): with nothing picked the button reads "Buy Ticket"
 * and is disabled.
 */
import type { TicketType } from '~/types/ticket'
import { formatNaira } from '~/utils/money'

const props = defineProps<{ tickets: TicketType[]; total: number; count: number }>()
const quantities = defineModel<Record<string, number>>('quantities', { required: true })
const emit = defineEmits<{ buy: [] }>()

const buyLabel = computed(() => (props.count ? `Buy Ticket (${formatNaira(props.total)})` : 'Buy Ticket'))
</script>

<template>
  <section class="ticket-panel" aria-label="Tickets">
    <ul class="ticket-panel__list">
      <li v-for="t in tickets" :key="t.id">
        <TicketOption v-model:quantity="quantities[t.id]" :ticket="t" />
      </li>
    </ul>
    <UiButton class="ticket-panel__buy" text-style="web" :disabled="!count" @click="emit('buy')">{{ buyLabel }}</UiButton>
  </section>
</template>

<style scoped>
.ticket-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-section);
  padding: calc(var(--spacing-md) - var(--border-width-default));
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-xl);
  background: var(--color-background-primary);
}
.ticket-panel__list { display: flex; flex-direction: column; gap: var(--spacing-md); margin: 0; padding: 0; list-style: none; }
.ticket-panel__buy { width: 100%; }

/* Below 1024px: just the cards (phone frame); the bottom bar takes over */
@media (max-width: 1023px) {
  .ticket-panel { padding: 0; border: 0; border-radius: 0; }
  .ticket-panel__buy { display: none; }
}
</style>
