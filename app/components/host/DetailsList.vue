<script setup lang="ts">
import './styles.css'
/**
 * "Details" / "Edit Details" list (Figma frames 02, 03, edition 02, 03):
 * heading Small app semibold, then rows; 16px above and below each 1px Grey_5
 * divider (dividers that start 40px in (under the text, not the icon)).
 * Each row is a HostDetailsRow passed in the default slot; this component
 * only draws the heading and dividers.
 */
defineProps<{ heading: string }>()
</script>

<template>
  <section class="host-details" :aria-label="heading">
    <h3 class="host-details__heading text-app-small-semibold">{{ heading }}</h3>
    <div class="host-details__rows">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.host-details { display: flex; flex-direction: column; gap: var(--spacing-md); }
.host-details__heading { margin: 0; color: var(--color-text-option); }
.host-details__rows { display: flex; flex-direction: column; gap: calc(2 * var(--spacing-md) + 1px); }
.host-details__rows > :deep(* + *) { position: relative; }
.host-details__rows > :deep(* + *)::before {
  content: '';
  position: absolute;
  top: calc(-1 * var(--spacing-md) - 1px);
  left: 40px;
  right: 0;
  height: 1px;
  background: var(--color-border-default);
}
</style>
