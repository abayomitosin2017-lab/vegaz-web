<script setup lang="ts">
/**
 * EventSection: a titled row of event cards, as used four times on Home.
 *
 * 768px and up (Desktop - 29): cards share the row width equally, 16px gap.
 *   768-1023 (tablet) shows one card fewer per row (design decision).
 *   The optional #action slot sits below the cards, left aligned, 24 under
 *   them (decision 27 Oct; was right of the title).
 * Below 768px (HOME/DEFAULT/MOBILE): the row scrolls sideways; cards keep a
 *   fixed width (small 160px, medium 205px, rounded from Figma's 160.57 and
 *   205.33). The #action slot sits below the cards, left-aligned.
 */
import type { EventSummary } from '~/types/event'

withDefaults(
  defineProps<{ title: string; events: EventSummary[]; cardSize?: 'small' | 'medium' }>(),
  { cardSize: 'small' },
)
const headingId = useId()
</script>

<template>
  <section :class="['event-section', `event-section--${cardSize}`]" :aria-labelledby="headingId">
    <h2 :id="headingId" class="event-section__title text-h3-semibold">{{ title }}</h2>
    <div v-if="$slots.action" class="event-section__action">
      <slot name="action" />
    </div>
    <div class="event-section__row">
      <EventCard v-for="event in events" :key="event.id" :event="event" :size="cardSize" :morph-source="title" class="event-section__card" />
    </div>
  </section>
</template>

<style scoped>
/* ---- Mobile (< 768px) ---- */
.event-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: var(--spacing-lg);
}
.event-section__title {
  grid-row: 1;
  color: var(--color-text-primary);
  white-space: nowrap;
  /* Airbnb home row title: 18/24 w600 -0.18 on phones, 20/24 from 768 */
  font-weight: var(--text-section-title-weight);
  font-size: var(--text-section-title-size);
  line-height: var(--text-section-title-line);
  letter-spacing: var(--text-section-title-tracking);
}
.event-section__row {
  grid-row: 2;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  /* Scroll edge to edge while the first card still lines up with the page margin */
  margin-inline: calc(-1 * var(--container-inset-mobile));
  padding-inline: var(--container-inset-mobile);
  overflow-x: auto;
  /* No scrollbar under the cards (decision 27 Oct) */
  scrollbar-width: none;
}
.event-section__row::-webkit-scrollbar { display: none; }
/* Phones: 12 extra below the cards, so a scroll bar (where the phone shows
   one anyway) sits under the text, not on it (decision 27 Oct) */
@media (max-width: 767px) {
  .event-section__row { padding-bottom: var(--spacing-sm); }
}
.event-section__card { flex: none; }
.event-section { --event-card-width-small: 160.571px; --event-card-width-medium: 205.333px; }
/* Figma mobile card widths (HOME/DEFAULT/MOBILE). FLAG: Figma's "Explore all
   events" row uses 159.29px small cards; 160.57px is used for both small rows. */
.event-section--small .event-section__card { width: var(--event-card-width-small); }
.event-section--medium .event-section__card { width: var(--event-card-width-medium); }
.event-section__action {
  grid-row: 3;
  justify-self: start;
}

/* ---- 768px and up ---- */
@media (min-width: 768px) {
  .event-section { grid-template-columns: minmax(0, 1fr) auto; }
  .event-section__title { grid-column: 1; align-self: center; }
  .event-section__action { grid-row: 3; grid-column: 1; } /* below the cards, left aligned (decision 27 Oct) */
  .event-section__row {
    grid-column: 1 / -1;
    /* Figma centres the cards; top-aligned here so cards whose text wraps on
       squeezed widths still line up. Identical at 1440 (all cards same height). */
    align-items: flex-start;
    margin-inline: 0;
    padding-inline: 0;
    overflow: visible;
  }
  .event-section__card,
  .event-section--small .event-section__card,
  .event-section--medium .event-section__card { flex: 1 0 0; width: auto; min-width: 0; }
}

/* ---- Tablet (768-1023): one card fewer per row so cards are not too squeezed ---- */
@media (min-width: 768px) and (max-width: 1023px) {
  .event-section__card:last-child:not(:only-child) { display: none; }
}
</style>
