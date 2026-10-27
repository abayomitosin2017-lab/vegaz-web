<script setup lang="ts">
/**
 * UiStateMessage: the one layout for "nothing to show" moments: errors,
 * offline, empty lists, not found (NOT IN FIGMA, PROPOSED 27 Oct).
 *
 * Centred: a 64 round Grey_6 circle with a 32 line icon (Grey_1), 16 below
 * the title (18/24 semibold, Grey_1), 4 below the text (14/20, Grey_2,
 * at most 360 wide), 24 below an optional small secondary button.
 * `compact`: for small spaces (search dropdown, pop-up lists, chat): no icon,
 * title 16/20, tighter spacing, padding 24.
 */
withDefaults(defineProps<{
  icon?: string
  title: string
  text?: string
  actionLabel?: string
  busy?: boolean
  compact?: boolean
  /** Heading level for the title (2 on pages, 3 inside sections) */
  level?: 1 | 2 | 3 | 4
  /** 'alert': announced as soon as it appears (errors) */
  live?: 'alert' | 'status'
}>(), { level: 3, live: undefined })
const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div :class="['ui-state', { 'ui-state--compact': compact }]" :role="live">
    <span v-if="icon && !compact" class="ui-state__icon" aria-hidden="true"><img :src="icon" alt="" width="32" height="32" /></span>
    <component :is="`h${level}`" class="ui-state__title">{{ title }}</component>
    <p v-if="text" class="ui-state__text">{{ text }}</p>
    <UiButton
      v-if="actionLabel"
      class="ui-state__action"
      size="small"
      color="secondary"
      text-style="web"
      :disabled="busy"
      :aria-busy="busy ? 'true' : undefined"
      @click="emit('action')"
    >{{ actionLabel }}</UiButton>
    <slot />
  </div>
</template>

<style scoped>
.ui-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-2xl) var(--spacing-md);
  text-align: center;
}
.ui-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius-pill);
  background: var(--color-background-secondary);
}
.ui-state__title {
  margin: 0;
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  font-size: 18px;
  font-weight: var(--font-weight-semibold);
  line-height: 24px;
}
.ui-state__text {
  max-width: 360px;
  margin: var(--spacing-xxs) 0 0;
  color: var(--color-text-secondary);
  font-family: var(--font-family-base);
  font-size: 14px;
  line-height: 20px;
}
.ui-state__action { margin-top: var(--spacing-lg); --ui-button-border-color: var(--color-border-default); }
.ui-state--compact { padding: var(--spacing-lg) var(--spacing-md); }
.ui-state--compact .ui-state__title { font-size: 16px; line-height: 20px; }
.ui-state--compact .ui-state__action { margin-top: var(--spacing-md); }
</style>
