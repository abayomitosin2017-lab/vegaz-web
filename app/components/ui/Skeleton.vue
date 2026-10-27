<script setup lang="ts">
/**
 * UiSkeleton: one grey placeholder shape shown while content loads
 * (decision 27 Oct; NOT IN FIGMA, PROPOSED). Grey_6 with a soft light sweep
 * (Grey_5 band, 1.4s), like Airbnb / LinkedIn. No motion for people who
 * reduce motion. Decorative: screen readers skip it (the area it sits in
 * says it is busy with aria-busy).
 * Size and corners come from props or from the parent's CSS.
 */
withDefaults(defineProps<{ width?: string; height?: string; radius?: string; block?: boolean }>(), {
  width: '100%', height: '16px', radius: 'var(--radius-sm)', block: true,
})
</script>

<template>
  <span :class="['ui-skeleton', { 'ui-skeleton--inline': !block }]" :style="{ width, height, borderRadius: radius }" aria-hidden="true" />
</template>

<style scoped>
.ui-skeleton {
  display: block;
  flex: none;
  max-width: 100%;
  background-color: var(--color-background-secondary);
  background-image: linear-gradient(90deg, transparent 0%, var(--color-border-default) 50%, transparent 100%);
  background-size: 200% 100%;
  background-repeat: no-repeat;
  animation: ui-skeleton-shimmer 1.4s ease-in-out infinite;
}
.ui-skeleton--inline { display: inline-block; vertical-align: middle; }
@keyframes ui-skeleton-shimmer {
  0% { background-position: 150% 0; }
  100% { background-position: -50% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-skeleton { animation: none; background-image: none; }
}
</style>
