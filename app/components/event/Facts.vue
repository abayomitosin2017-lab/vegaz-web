<script setup lang="ts">
/**
 * EventFacts: address, date and price rows (Figma event details).
 *
 * Icons from Figma 10894:35489 (Phosphor MapPin, CalendarDots, Ticket,
 * CopySimple; decision 27 Oct): no tile around them. Sizes from Airbnb's
 * listing rows: icon 24, 16 to the text, text 16/20 regular, 24 between
 * rows (Figma: 20 icons, 18 apart). Text Grey_1 (phones Grey_2).
 * - Address: map pin; a copy button on the right copies the address
 *   ("Address copied" toast, decision 22 Oct).
 * - Date: calendar icon + the date label (the month/day tile is gone).
 *   #date-action slot: "Add to calendar" on the right (decision 27 Oct).
 * - Price: ticket icon + price range from the ticket prices ("Free - ₦10,000").
 */
defineProps<{ address: string; startsAt: string; dateLabel: string; price: string }>()
const emit = defineEmits<{ 'copy-address': [] }>()

</script>

<template>
  <ul class="event-facts">
    <li class="event-facts__row">
      <img class="event-facts__icon" src="/images/event/icon-map-pin-20.svg" alt="" width="24" height="24" aria-hidden="true" />
      <span class="event-facts__text"><span class="visually-hidden">Address: </span>{{ address }}</span>
      <button type="button" class="event-facts__copy" aria-label="Copy address" @click="emit('copy-address')">
        <img src="/images/event/icon-copy-simple-16.svg" alt="" width="16" height="16" />
      </button>
    </li>
    <li class="event-facts__row event-facts__row--date">
      <img class="event-facts__icon" src="/images/event/icon-calendar-dots-20.svg" alt="" width="24" height="24" aria-hidden="true" />
      <span class="event-facts__text"><span class="visually-hidden">Date: </span>{{ dateLabel }}</span>
      <slot name="date-action" />
    </li>
    <li class="event-facts__row">
      <img class="event-facts__icon" src="/images/event/icon-ticket-20.svg" alt="" width="24" height="24" aria-hidden="true" />
      <span class="event-facts__text"><span class="visually-hidden">Price: </span>{{ price }}</span>
    </li>
  </ul>
</template>

<style scoped>
.event-facts {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg); /* Airbnb: 24 between rows */
  margin: 0;
  padding: 0;
  list-style: none;
}
.event-facts__row { display: flex; align-items: flex-start; gap: var(--spacing-md); min-height: 28px; } /* Airbnb: 16 icon to text; every row 28 (the Add to calendar pill) so the gaps match */
.event-facts__icon { flex: none; display: block; width: 24px; height: 24px; margin-top: 2px; } /* Airbnb 24, centred in the 28 row */
.event-facts__text {
  flex: 1;
  min-width: 0;
  padding-top: 4px; /* centres the 20px line in the 28 row */
  color: var(--color-text-strong);
  overflow-wrap: anywhere;
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-regular);
  font-size: 16px; /* Airbnb listing rows: 16/20 regular */
  line-height: 20px;
}
.event-facts__copy {
  flex: none;
  display: inline-flex;
  padding: var(--spacing-xs);
  margin: calc(-1 * var(--spacing-xxs)) calc(-1 * var(--spacing-xs)) calc(-1 * var(--spacing-xxs)) 0; /* 32 tap area inside the 28 row */
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
}
.event-facts__copy:hover { background: var(--color-background-secondary); } /* proposed */
.event-facts__copy:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 767px) {
  .event-facts__text { color: var(--color-text-secondary); } /* Figma phone: Grey_2 */
}
</style>
