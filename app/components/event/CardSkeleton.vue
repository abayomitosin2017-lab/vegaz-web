<script setup lang="ts">
/**
 * EventCardSkeleton: loading placeholder in the shape of an EventCard
 * (decision 27 Oct): square photo (radius 16; the medium desktop photo
 * height follows --event-card-media-height like the real card), then the
 * title line and the place and date lines, same gaps as the card.
 */
withDefaults(defineProps<{ size?: 'small' | 'medium' }>(), { size: 'small' })
</script>

<template>
  <div :class="['event-card-sk', `event-card-sk--${size}`]" aria-hidden="true">
    <UiSkeleton class="event-card-sk__media" height="auto" radius="var(--radius-lg)" />
    <div class="event-card-sk__body">
      <UiSkeleton width="78%" height="18px" />
      <UiSkeleton width="56%" height="14px" />
      <UiSkeleton width="44%" height="14px" />
    </div>
  </div>
</template>

<style scoped>
.event-card-sk { display: flex; flex-direction: column; gap: var(--spacing-sm); min-width: 0; }
.event-card-sk__media { width: 100%; aspect-ratio: 1 / 1; }
.event-card-sk__body { display: flex; flex-direction: column; gap: var(--spacing-xs); padding-inline: var(--spacing-xxs); }
@media (min-width: 1024px) {
  .event-card-sk--medium .event-card-sk__media { aspect-ratio: auto; height: var(--event-card-media-height, auto); }
}
</style>
