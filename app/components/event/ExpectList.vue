<script setup lang="ts">
/**
 * EventExpectList: "What to expect" (Figma "What to expects"; typo fixed,
 * decision 22 Oct). Title Headline 3 semibold, 24px above the list.
 * Rows 8px apart (phones 16): 72px photo (phones 80), radius 12, 16px gap;
 * title Web Body semibold Grey_1 over the description Web Small regular
 * Grey_2, 4px apart (phones 8).
 */
import type { EventExpectation } from '~/types/event'

defineProps<{ items: EventExpectation[] }>()
</script>

<template>
  <section class="event-expect" aria-labelledby="event-expect-title">
    <h2 id="event-expect-title" class="event-title text-section-title">What to expect</h2>
    <ul class="event-expect__list">
      <li v-for="item in items" :key="item.title" class="event-expect__row">
        <span class="event-expect__photo">
          <img v-if="item.imageUrl" :src="item.imageUrl" alt="" width="72" height="72" />
        </span>
        <span class="event-expect__text">
          <span class="event-expect__title text-body-semibold">{{ item.title }}</span>
          <span class="event-expect__desc text-small-regular">{{ item.description }}</span>
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.event-expect { display: flex; flex-direction: column; gap: var(--spacing-lg); }
.event-expect__list { display: flex; flex-direction: column; gap: var(--spacing-xs); margin: 0; padding: 0; list-style: none; }
.event-expect__row { display: flex; align-items: center; gap: var(--spacing-md); min-height: 80px; }
.event-expect__photo {
  flex: none;
  width: 72px;
  height: 72px;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--color-placeholder-media);
}
.event-expect__photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.event-expect__text { display: flex; flex-direction: column; gap: var(--spacing-xxs); min-width: 0; }
.event-expect__title { color: var(--color-text-strong); }
.event-expect__desc { color: var(--color-text-secondary); }

@media (max-width: 767px) {
  .event-expect__list { gap: var(--spacing-md); }
  .event-expect__photo { width: 80px; height: 80px; }
  .event-expect__text { gap: var(--spacing-xs); }
}
.event-title { margin: 0; color: var(--color-text-primary); }
</style>
