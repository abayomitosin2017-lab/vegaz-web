<script setup lang="ts">
/**
 * EventHangoutCard: Figma "Hangout card" component (node 10002:40583).
 *
 * Figma axis -> prop
 *   Property 1 = "Small card"  -> size="small"  (square image, chip 8px from corner)
 *   Property 1 = "Medium card" -> size="medium" (image fills a fixed-height card, chip 10px)
 *   Property 1 = "big" and Property 2 = "with attendees" -> not built (not in this frame)
 *
 * Medium card:
 *   - 1024px and up: image height set by the screen through
 *     `--hangout-card-media-height` (Figma desktop instances: 285.3px card =
 *     193.3px image + text). Fixing the image rather than the card keeps
 *     images level when a title wraps to 2 lines on narrower desktops.
 *   - below 1024px: square image, as in HOME/DEFAULT/MOBILE (Figma 5547:1118),
 *     so images stay even when text wraps on squeezed tablet widths.
 * Width comes from the parent row.
 * Not interactive yet: Figma does not define where a card goes.
 */
import type { EventSummary } from '~/types/event'

withDefaults(defineProps<{ event: EventSummary; size?: 'small' | 'medium' }>(), { size: 'small' })
</script>

<template>
  <article :class="['hangout-card', `hangout-card--${size}`]">
    <div class="hangout-card__media">
      <img v-if="event.imageUrl" class="hangout-card__image" :src="event.imageUrl" alt="" />
      <span class="hangout-card__chip text-xsmall-semibold">
        <span class="hangout-card__chip-text">{{ event.category }}</span>
      </span>
    </div>
    <div class="hangout-card__body">
      <h3 class="hangout-card__title text-small-semibold">{{ event.title }}</h3>
      <p class="hangout-card__meta text-small-regular">{{ event.location }}</p>
      <p class="hangout-card__meta text-small-regular hangout-card__date">{{ event.dateLabel }}</p>
    </div>
  </article>
</template>

<style scoped>
.hangout-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-width: 0;
}

.hangout-card__media {
  position: relative;
  overflow: clip;
  width: 100%;
  border-radius: var(--radius-lg);
  background: var(--color-placeholder-media);
}
.hangout-card--small .hangout-card__media { aspect-ratio: 1 / 1; }
.hangout-card--medium .hangout-card__media { aspect-ratio: 1 / 1; }
@media (min-width: 1024px) {
  .hangout-card--medium .hangout-card__media { aspect-ratio: auto; height: var(--hangout-card-media-height, auto); }
}

.hangout-card__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hangout-card__chip {
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
.hangout-card__chip-text { overflow: hidden; text-overflow: ellipsis; }
/* Medium card places the chip 10px from the corner in Figma */
.hangout-card--medium .hangout-card__chip {
  top: var(--spacing-inline);
  left: var(--spacing-inline);
  max-width: calc(100% - 2 * var(--spacing-inline));
}

.hangout-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
  padding-inline: var(--spacing-xxs);
}
.hangout-card__title { color: var(--color-text-primary); }
.hangout-card__meta { color: var(--color-text-secondary); }

/* Overflow rule from Figma "Hangout card" (node 7343:7945):
   title stops after 2 lines with "...", location and date stay on one line
   and end in "..." when too long. Long words break rather than spill. */
.hangout-card__title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
}
.hangout-card__meta {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
