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
 * Buy Ticket opens the buy ticket flow (the page shows CheckoutFlow).
 * Not in Figma (proposed): with nothing picked the button reads "Buy Ticket"
 * and is disabled.
 * Holding a ticket (decision 22 Oct): the cards and Buy Ticket stay, so more
 * can be bought for others, and the chat header's "Share Event" button
 * (grey pill, share icon) appears under them, full width.
 * Host's own event (decision 26 Oct, PROPOSED look): the cards show without
 * steppers, "Open Chat" replaces Buy Ticket (on every screen size) and
 * Share Event sits under it.
 * Ended event (decision 30 Oct): prices stay, the steppers go and the
 * button reads "Event ended", disabled.
 */
import type { TicketType } from '~/types/ticket'
import { formatNaira } from '~/utils/money'
import { isFreeOnly, RSVP_LABEL } from '~/utils/ticketCta'

const props = defineProps<{ tickets: TicketType[]; total: number; count: number; holding?: boolean; host?: boolean; busy?: boolean; ended?: boolean }>()
const quantities = defineModel<Record<string, number>>('quantities', { required: true })
const emit = defineEmits<{ buy: []; share: []; chat: [] }>()

// Free-only selection (or an event with only free tickets): RSVP (decision 26 Oct)
const free = computed(() => isFreeOnly(props.tickets, quantities.value))
const buyLabel = computed(() => (props.ended ? 'Event ended' : free.value ? RSVP_LABEL : props.count ? `Buy Ticket (${formatNaira(props.total)})` : 'Buy Ticket'))
</script>

<template>
  <section class="ticket-panel" aria-label="Tickets">
    <ul class="ticket-panel__list">
      <li v-for="t in tickets" :key="t.id">
        <TicketOption v-model:quantity="quantities[t.id]" :ticket="t" :preview="host || ended" />
      </li>
    </ul>
    <UiButton v-if="host" class="ticket-panel__buy ticket-panel__chat" text-style="web" :aria-busy="busy ? 'true' : undefined" @click="!busy && emit('chat')">
      <template #icon><img src="/images/host/icon-chat-light-24.svg" alt="" width="24" height="24" /></template>
      Open Chat
    </UiButton>
    <UiButton v-else class="ticket-panel__buy" text-style="web" :disabled="ended || !count" @click="emit('buy')">{{ buyLabel }}</UiButton>
    <UiButton v-if="holding || host" color="secondary" class="ticket-panel__share" @click="emit('share')">
      <template #icon><img src="/images/chat/icon-share-24.svg" alt="" width="24" height="24" /></template>
      Share Event
    </UiButton>
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
/* Same look as the chat header "Share Event" (grey pill, no border, 16/24) */
.ticket-panel__share {
  width: 100%;
  margin-top: calc(var(--spacing-xs) - var(--spacing-section));
  --ui-button-border-color: transparent;
}

/* Open Chat and Share Event live in the title row (desktop) and the sticky
   header (phones / tablets), so the panel doesn't repeat them (decision 27 Oct) */
.ticket-panel__chat, .ticket-panel__share { display: none; }
/* Below 1024px: just the cards (phone frame); the bottom bar takes over */
@media (max-width: 1023px) {
  .ticket-panel { padding: 0; border: 0; border-radius: 0; }
  .ticket-panel__buy:not(.ticket-panel__chat) { display: none; }
}
</style>
