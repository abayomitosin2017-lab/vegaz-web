<script setup lang="ts">
/**
 * UiInlineAlert: a one-line problem next to the thing it's about, e.g. a
 * photo that's too big, or "Couldn't save" under a button
 * (decision 27 Oct; NOT IN FIGMA, PROPOSED).
 * 16 red circle with "!", then the text (12/16 by default, 14/20 `size="small"`)
 * in Negative red; or `tone="inverse"` (white text) on purple chat bubbles.
 * Announced to screen readers when it appears.
 */
withDefaults(defineProps<{ text: string; size?: 'xsmall' | 'small'; tone?: 'negative' | 'inverse' }>(), { size: 'xsmall', tone: 'negative' })
</script>

<template>
  <p :class="['ui-inline-alert', `ui-inline-alert--${size}`, `ui-inline-alert--${tone}`]" role="alert">
    <img src="/images/states/icon-danger-16.svg" alt="" width="16" height="16" />
    <span>{{ text }}</span>
    <slot />
  </p>
</template>

<style scoped>
.ui-inline-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xxs);
  margin: 0;
  color: var(--color-status-error);
  font-family: var(--font-family-base);
}
.ui-inline-alert img { flex: none; margin-top: 0; }
.ui-inline-alert--xsmall { font-size: 12px; line-height: 16px; }
.ui-inline-alert--small { font-size: 14px; line-height: 20px; }
.ui-inline-alert--small img { margin-top: 2px; }
.ui-inline-alert--inverse { color: var(--base-white); }
</style>
