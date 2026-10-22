<script setup lang="ts">
/**
 * TicketOption: ticket type card from Figma "Component 13" (node 9832:32993).
 *
 * Figma variant -> data
 *   free / custom / vip -> availability 'available' (content from data)
 *   reminder            -> availability 'low': red badge with clock icon
 *                          ("5 ticket left"), "+" stops at maxQuantity
 *   sold ou(t)          -> availability 'sold-out': grey "Sold out" badge,
 *                          stepper empty and unusable
 *
 * Layout: a grey header strip with the ticket name, overlapped by a white
 * card (25px overlap) with price, description (max 2 lines, then "...") and
 * the quantity stepper. Width comes from the parent (415px in Figma).
 * Text uses the fixed Mobile App styles, as in Figma.
 */
import type { TicketType } from '~/types/ticket'

const props = defineProps<{ ticket: TicketType }>()
const quantity = defineModel<number>('quantity', { default: 0 })
const nameId = useId()
const isSoldOut = computed(() => props.ticket.availability === 'sold-out')
</script>

<template>
  <article :class="['ticket-option', { 'ticket-option--sold-out': isSoldOut }]" :aria-labelledby="nameId">
    <div class="ticket-option__header">
      <h3 :id="nameId" class="ticket-option__name">{{ ticket.name }}</h3>
      <UiBadge v-if="ticket.availability === 'low' && ticket.availabilityLabel" tone="negative">
        <template #icon><img src="/images/icon-clock-16.svg" alt="" width="16" height="16" /></template>
        {{ ticket.availabilityLabel }}
      </UiBadge>
      <UiBadge v-else-if="isSoldOut" tone="neutral">{{ ticket.availabilityLabel || 'Sold out' }}</UiBadge>
    </div>

    <div class="ticket-option__body">
      <div class="ticket-option__info">
        <p class="ticket-option__price">{{ ticket.priceLabel }}</p>
        <p class="ticket-option__description">{{ ticket.description }}</p>
      </div>
      <UiQuantityStepper
        v-model="quantity"
        :max="ticket.maxQuantity"
        :unavailable="isSoldOut"
        :label="`${ticket.name} tickets`"
      />
    </div>
  </article>
</template>

<style scoped>
.ticket-option {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Header strip: 12px top, 16px sides, 32px bottom (the card covers 25px of it).
   The 0.5px dashed hairline borders are drawn as an overlay (::after) so they
   never change the size, on any screen density (Figma draws them inside). */
.ticket-option__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: var(--color-ticket-header);
}
.ticket-option__header::after,
.ticket-option__body::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 0.5px dashed var(--color-ticket-border);
  border-radius: inherit;
  pointer-events: none;
}
/* On 1x screens a 0.5px line is drawn as a full pixel, which looks twice as
   dark as Figma; halve the opacity there so it reads the same. */
@media (max-resolution: 1.5dppx) {
  .ticket-option__header::after,
  .ticket-option__body::after { border-width: 1px; border-color: var(--color-ticket-border-subtle); }
}
.ticket-option__name {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-app-small-semibold-size);
  line-height: var(--text-app-small-semibold-line);
  letter-spacing: var(--text-app-small-semibold-tracking);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ticket-option__body {
  position: relative; /* sits over the header strip */
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-top: -25px; /* Figma: card starts 39px from the top of the 64px strip */
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  background: var(--color-background-primary);
}

.ticket-option__info {
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}
/* FLAG: Outfit has no Naira sign (₦); browsers draw it in a fallback font. */
.ticket-option__price {
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-bold);
  font-size: var(--text-app-h2-bold-size);
  line-height: var(--text-app-h2-bold-line);
  letter-spacing: var(--text-app-h2-bold-tracking);
  white-space: nowrap;
}
.ticket-option__description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
  color: var(--color-text-muted);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-regular);
  font-size: var(--text-app-xsmall-regular-size);
  line-height: var(--text-app-xsmall-regular-line);
  letter-spacing: var(--text-app-xsmall-regular-tracking);
}
</style>
