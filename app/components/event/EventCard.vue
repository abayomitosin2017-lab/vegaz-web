<script setup lang="ts">
/**
 * EventCard: one event (image, category chip, title, place, date).
 * Figma calls this component "Hangout card" (node 10002:40583); the product
 * now says "Events" everywhere, so the code uses Event.
 *
 * Figma axis -> prop
 *   Property 1 = "Small card"  -> size="small"  (square image, chip 8px from corner)
 *   Property 1 = "Medium card" -> size="medium" (image fills a fixed-height card, chip 10px)
 *   Property 1 = "big" and Property 2 = "with attendees" -> not built (not in this frame)
 *
 * Medium card:
 *   - 1024px and up: image height set by the screen through
 *     `--event-card-media-height` (Figma desktop instances: 285.3px card =
 *     193.3px image + text). Fixing the image rather than the card keeps
 *     images level when a title wraps to 2 lines on narrower desktops.
 *   - below 1024px: square image, as in HOME/DEFAULT/MOBILE (Figma 5547:1118),
 *     so images stay even when text wraps on squeezed tablet widths.
 * Width comes from the parent row.
 * The whole card opens the event's details page (decision 22 Oct). The title
 * is the link; its hit area is stretched over the card (one link per card for
 * screen readers).
 */
import type { EventSummary } from '~/types/event'

const props = withDefaults(
  defineProps<{
    event: EventSummary
    size?: 'small' | 'medium'
    /** Which list the card sits in (a Home row title, "all"...). Lets the
        photo grow into the event page from the exact card clicked. */
    morphSource?: string
  }>(),
  { size: 'small', morphSource: 'card' },
)
const morph = useEventMorph()
</script>

<template>
  <article :class="['event-card', 'img-zoom', `event-card--${size}`]">
    <div class="event-card__media" :style="morph.cardStyle(props.morphSource, event.id)">
      <img v-if="event.imageUrl" class="event-card__image" :src="event.imageUrl" alt="" />
      <span class="event-card__chip text-xsmall-semibold">
        <span class="event-card__chip-text">{{ event.category }}</span>
      </span>
    </div>
    <div class="event-card__body">
      <h3 class="event-card__title text-small-semibold">
        <NuxtLink :to="`/events/${event.id}`" class="event-card__link" @click="morph.start(props.morphSource, event.id)">{{ event.title }}</NuxtLink>
      </h3>
      <p class="event-card__meta text-small-regular">{{ event.location }}</p>
      <p class="event-card__meta text-small-regular event-card__date">{{ event.dateLabel }}</p>
    </div>
  </article>
</template>

<style scoped>
.event-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-width: 0;
}

.event-card__media {
  position: relative;
  overflow: clip;
  width: 100%;
  border-radius: var(--radius-lg);
  background: var(--color-placeholder-media);
}
.event-card--small .event-card__media { aspect-ratio: 1 / 1; }
.event-card--medium .event-card__media { aspect-ratio: 1 / 1; }
@media (min-width: 1024px) {
  .event-card--medium .event-card__media { aspect-ratio: auto; height: var(--event-card-media-height, auto); }
}

.event-card__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-card__chip {
  position: absolute;
  top: var(--spacing-xs);
  left: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xxs);
  height: 28px;
  padding-inline: var(--spacing-xs);
  border-radius: var(--radius-full);
  background: var(--color-background-primary);
  /* Figma drop shadow: 0 4 12, black 25% */
  box-shadow: var(--shadow-chip);
  /* Never wider than the image (only matters on squeezed tablet widths) */
  max-width: calc(100% - 2 * var(--spacing-xs));
  color: var(--color-text-primary);
  white-space: nowrap;
}
.event-card__chip-text { overflow: hidden; text-overflow: ellipsis; }
/* Medium card places the chip 10px from the corner in Figma */
.event-card--medium .event-card__chip {
  top: var(--spacing-inline);
  left: var(--spacing-inline);
  max-width: calc(100% - 2 * var(--spacing-inline));
}

.event-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
  padding-inline: var(--spacing-xxs);
}
.event-card__title { color: var(--color-text-primary); }
.event-card__meta { color: var(--color-text-secondary); }

/* Overflow rule from Figma "Hangout card" (node 7343:7945):
   title stops after 2 lines with "...", location and date stay on one line
   and end in "..." when too long. Long words break rather than spill. */
.event-card__title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
}
.event-card__meta {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.event-card__link { color: inherit; text-decoration: none; }
.event-card__link::after { content: ''; position: absolute; inset: 0; border-radius: var(--radius-lg); }
.event-card__link:focus-visible { outline: none; }
.event-card__link:focus-visible::after { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }
</style>
