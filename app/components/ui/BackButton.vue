<script setup lang="ts">
/**
 * UiBackButton: the one back button used across the app (decision 27 Oct).
 * 36px tap area with the 20px ArrowLeft and no background (decision 27 Oct:
 * no grey circle behind icon buttons; was #F1F1F1 at 50%). Hover fades it a
 * little (PROPOSED).
 * - Button by default (emits click); pass `to` for a link.
 * - `label` shows text beside the circle (e.g. "Back to Home"); without it
 *   the button is the icon only and `aria-label` names it ("Back" default).
 */
const props = withDefaults(defineProps<{ to?: string; label?: string; ariaLabel?: string }>(), { to: undefined, label: undefined, ariaLabel: 'Back' })
const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : 'button'))
</script>

<template>
  <component
    :is="tag"
    :to="to"
    :type="to ? undefined : 'button'"
    :class="['ui-back', { 'ui-back--label': label }]"
    :aria-label="label ? undefined : ariaLabel"
  >
    <span class="ui-back__circle" aria-hidden="true"><img src="/images/icon-back-20.svg" alt="" width="20" height="20" /></span>
    <span v-if="label" class="ui-back__label text-small-semibold">{{ label }}</span>
  </component>
</template>

<style scoped>
.ui-back {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 0;
  border: 0;
  border-radius: var(--radius-pill);
  background: none;
  color: var(--color-text-primary);
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.ui-back__circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  background: none; /* no grey circle behind icons (decision 27 Oct) */
}
.ui-back__circle img { display: block; width: 20px; height: 20px; }
.ui-back:hover .ui-back__circle { opacity: 0.7; } /* proposed */
.ui-back--label { padding-right: var(--spacing-xs); }
.ui-back:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
</style>
