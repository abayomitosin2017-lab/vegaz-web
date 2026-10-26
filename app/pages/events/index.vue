<script setup lang="ts">
/**
 * All events (Home "Explore all" -> here; decision 22 Oct).
 * NOT IN FIGMA (proposed): built from existing pieces only.
 *   - "Back to Home" link (chat arrow icon + Web Small semibold, Primary)
 *   - Title: page title style + count in Grey_2, like "Community (24)"
 *   - Every event as a small EventCard in a grid, 16px gaps:
 *     phones 1 per row, full width (decision 22 Oct: bigger images),
 *     tablet (768-1023) 4, desktop 5 (as on Home)
 *   - Page padding matches Home
 * OPEN ITEMS: order, paging/infinite scroll, filters (by category or date).
 */
import { getAllEvents } from '~/services/events'

const { data: events } = await useAsyncData('all-events', getAllEvents, { default: () => [] })

useHead({ title: 'All events · Vegaz' })
</script>

<template>
  <div class="all-events">
    <NuxtLink to="/" class="all-events__back text-small-semibold">
      <img src="/images/chat/icon-arrow-left-20.svg" alt="" width="16" height="16" />
      Back to Home
    </NuxtLink>

    <h1 class="all-events__title text-page-title">
      All events <span class="all-events__count">({{ events.length }})</span>
    </h1>

    <ul class="all-events__grid">
      <li v-for="e in events" :key="e.id">
        <EventCard :event="e" size="small" morph-source="all" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* ---- Phones (< 768px) ---- */
.all-events {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: calc(var(--container-web-desktop-max) + 2 * var(--container-inset-desktop));
  margin-inline: auto;
  padding: var(--spacing-page-top) var(--container-inset-mobile) 42px;
}
.all-events__back {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  align-self: flex-start;
  margin-left: calc(-1 * var(--spacing-xxs));
  padding: var(--spacing-xxs);
  border-radius: var(--radius-sm);
  color: var(--color-action-primary);
  text-decoration: none;
}
.all-events__back:hover { background: var(--color-background-secondary); }
.all-events__back:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
.all-events__title { margin: 0; color: var(--color-text-primary); }
.all-events__count { font-weight: var(--font-weight-regular); color: var(--color-text-secondary); }
.all-events__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr); /* phones: one card per row */
  gap: var(--spacing-xl) var(--spacing-md);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ---- Tablet (768-1023): 4 per row ---- */
@media (min-width: 768px) {
  .all-events { padding: var(--spacing-page-top) var(--container-inset-tablet) 141px; }
  .all-events__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
/* ---- Desktop (>= 1024): 5 per row, as the Home rows ---- */
@media (min-width: 1024px) {
  .all-events { padding-inline: var(--container-inset-desktop); }
  .all-events__grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}
</style>
