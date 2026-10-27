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
 * With "?q=" (phone search, decision 27 Oct): "Results for “…” (N)" and the
 *   matching events; a short message when nothing matches.
 * OPEN ITEMS: order, paging/infinite scroll, filters (by category or date).
 */
import { getAllEvents, searchEvents } from '~/services/events'

// "?q=" (phone search, decision 27 Oct): the events matching the search
const route = useRoute()
const q = computed(() => String(route.query.q ?? '').trim())
const { data: events } = await useAsyncData('all-events', () => (q.value ? searchEvents(q.value, 100) : getAllEvents()), { default: () => [], watch: [q] })

useHead(() => ({ title: q.value ? `“${q.value}” · Vegaz` : 'All events · Vegaz' }))
</script>

<template>
  <div class="all-events">
    <UiBackButton to="/" label="Back to Home" class="all-events__back" />

    <h1 class="all-events__title text-page-title">
      <template v-if="q">Results for “{{ q }}”</template><template v-else>All events</template> <span class="all-events__count">({{ events.length }})</span>
    </h1>
    <p v-if="q && !events.length" class="all-events__empty text-body-regular">No events found. Try another name, place or category.</p>

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
.all-events__back { align-self: flex-start; } /* UiBackButton (decision 27 Oct) */
.all-events__title { margin: 0; color: var(--color-text-primary); overflow-wrap: anywhere; }
.all-events__empty { margin: 0; color: var(--color-text-secondary); }
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
