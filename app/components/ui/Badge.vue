<script setup lang="ts">
/**
 * UiBadge: small status pill from the Figma ticket option card ("Chips").
 *   tone="negative": Base negative red, white 12/18 regular text, optional
 *                    16px icon on the left ("5 ticket left")
 *   tone="neutral":  Grey_5, Grey_1 12/18 semibold text ("Sold out")
 * FLAG: white 12px text on #FF3B2D is about 3.5:1 contrast, below the 4.5:1
 * WCAG AA target for small text. Review with design.
 */
withDefaults(defineProps<{ tone?: 'negative' | 'neutral' }>(), { tone: 'neutral' })
</script>

<template>
  <span :class="['ui-badge', `ui-badge--${tone}`, { 'ui-badge--with-icon': $slots.icon }]">
    <span v-if="$slots.icon" class="ui-badge__icon" aria-hidden="true"><slot name="icon" /></span>
    <span class="ui-badge__label"><slot /></span>
  </span>
</template>

<style scoped>
.ui-badge {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(--spacing-xxs);
  height: 20px;
  padding-inline: var(--spacing-xs);
  border-radius: 36px;
  font-family: var(--font-family-base);
  font-size: var(--text-app-xsmall-regular-size);
  line-height: var(--text-app-xsmall-regular-line);
  letter-spacing: var(--text-app-xsmall-regular-tracking);
  white-space: nowrap;
}
.ui-badge--with-icon { padding-left: 3px; } /* Figma: 3px before the icon */
.ui-badge__icon { display: inline-flex; width: 16px; height: 16px; }
.ui-badge__icon :deep(img) { width: 16px; height: 16px; }

.ui-badge--negative {
  background: var(--color-status-error);
  color: var(--color-text-inverse);
  font-weight: var(--font-weight-regular);
}
.ui-badge--neutral {
  background: var(--color-background-neutral);
  color: var(--color-text-strong);
  font-weight: var(--font-weight-semibold);
}
</style>
