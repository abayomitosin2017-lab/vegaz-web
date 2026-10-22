<script setup lang="ts">
/**
 * EventFacts: address, date and price rows (Figma event details).
 *
 * Each row: a 40px-wide outlined tile (Grey_5 line, radius 8) with an icon,
 * 16px gap, then the text (Web Body regular Grey_1; phones: 16/24 Grey_2).
 * - Address: map pin; a copy button on the right copies the address
 *   ("Address copied" toast, decision 22 Oct).
 * - Date: calendar tile: month (Sub bold, Grey_3, Grey_5 top) over the day
 *   (Web Body semibold) + the date label. Figma shows "SEP 30" next to
 *   "16 Jan 2026"; the tile is built from the real date (decision 22 Oct).
 * - Price: ticket icon + price range from the ticket prices ("Free - ₦10,000").
 */
const props = defineProps<{ address: string; startsAt: string; dateLabel: string; price: string }>()
const emit = defineEmits<{ 'copy-address': [] }>()

const date = computed(() => new Date(props.startsAt))
const month = computed(() => date.value.toLocaleString('en-GB', { month: 'short' }).toUpperCase())
const day = computed(() => date.value.getDate())
</script>

<template>
  <ul class="event-facts">
    <li class="event-facts__row">
      <span class="event-facts__icon" aria-hidden="true">
        <img src="/images/event/icon-map-point-24.svg" alt="" width="24" height="24" />
      </span>
      <span class="event-facts__text text-body-regular"><span class="visually-hidden">Address: </span>{{ address }}</span>
      <button type="button" class="event-facts__copy" aria-label="Copy address" @click="emit('copy-address')">
        <img src="/images/event/icon-copy-16.svg" alt="" width="16" height="16" />
      </button>
    </li>
    <li class="event-facts__row">
      <span class="event-facts__cal" aria-hidden="true">
        <span class="event-facts__month text-sub-bold">{{ month }}</span>
        <span class="event-facts__day text-body-semibold">{{ day }}</span>
      </span>
      <span class="event-facts__text text-body-regular"><span class="visually-hidden">Date: </span>{{ dateLabel }}</span>
    </li>
    <li class="event-facts__row">
      <span class="event-facts__icon" aria-hidden="true">
        <img src="/images/event/icon-ticket-24.svg" alt="" width="24" height="24" />
      </span>
      <span class="event-facts__text text-body-regular"><span class="visually-hidden">Price: </span>{{ price }}</span>
    </li>
  </ul>
</template>

<style scoped>
.event-facts {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin: 0;
  padding: 0;
  list-style: none;
}
.event-facts__row { display: flex; align-items: center; gap: var(--spacing-md); }
.event-facts__icon {
  flex: none;
  display: inline-flex;
  justify-content: center;
  width: 40px;
  padding: 10px var(--spacing-xs); /* Figma 11px inside a 1px line */
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-sm);
}
.event-facts__text { flex: 1; min-width: 0; color: var(--color-text-strong); overflow-wrap: anywhere; }
.event-facts__copy {
  flex: none;
  display: inline-flex;
  padding: var(--spacing-xs);
  margin: calc(-1 * var(--spacing-xs));
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
}
.event-facts__copy:hover { background: var(--color-background-secondary); } /* proposed */
.event-facts__copy:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }

.event-facts__cal { flex: none; display: flex; flex-direction: column; width: 40px; text-align: center; }
.event-facts__month {
  padding: var(--spacing-micro) var(--spacing-xs);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: var(--color-border-default);
  color: var(--color-text-muted);
}
.event-facts__day {
  padding: 1px var(--spacing-xs);
  border: var(--border-width-default) solid var(--color-border-default);
  border-top: 0;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  color: var(--color-text-strong);
}

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
