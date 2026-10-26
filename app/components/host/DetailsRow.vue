<script setup lang="ts">
import './styles.css'
/**
 * One row of the "Details" list (Figma component "Host / Details row",
 * 10771:17430). 24px Grey_3 icon, label (Small app regular 14/20, #0E0F11),
 * value on the right (14/20, #8895A7), optional "Edit" pill (Grey_6, radius
 * 30, 4 / 12 padding, semibold Grey_1), 16px chevron; 16 apart.
 * The whole row is a button that opens its dialog; a row without `clickable`
 * (Edition number) is plain text.
 */
const props = withDefaults(defineProps<{
  icon: 'event-details' | 'date-time' | 'edition' | 'location' | 'categories' | 'participants'
  label: string
  value?: string
  edit?: boolean
  clickable?: boolean
}>(), { value: undefined, edit: false, clickable: true })
defineEmits<{ open: [] }>()
</script>

<template>
  <component
    :is="clickable ? 'button' : 'div'"
    :type="clickable ? 'button' : undefined"
    :class="['host-row', { 'host-row--button': clickable }]"
    @click="clickable && $emit('open')"
  >
    <img class="host-row__icon" :src="`/images/host/row-${icon}.svg`" alt="" width="24" height="24" />
    <span class="host-row__label text-app-small-regular">{{ label }}</span>
    <span v-if="value" class="host-row__value text-app-small-regular">{{ value }}</span>
    <span v-if="edit" class="host-row__edit" aria-hidden="true">Edit</span>
    <img v-if="clickable" class="host-row__chevron" src="/images/host/icon-chevron-right-16.svg" alt="" width="16" height="16" />
  </component>
</template>

<style scoped>
.host-row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  min-height: 24px;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  font: inherit;
}
.host-row--button { cursor: pointer; border-radius: var(--radius-xs); }
.host-row--button:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 4px; }
.host-row--button:hover .host-row__label { color: var(--color-action-primary); }
.host-row__icon { flex: none; width: 24px; height: 24px; }
.host-row__label { flex: 1 0 auto; min-width: 0; white-space: nowrap; color: var(--color-host-row-label); transition: color 150ms ease; }
.host-row__value { flex: 0 1 auto; min-width: 0; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-host-row-value); }
.host-row__edit {
  flex: none;
  padding: var(--spacing-xxs) var(--spacing-sm);
  border-radius: 30px;
  background: var(--color-background-secondary);
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  font-size: 11px; /* Figma 10.58px */
  line-height: 16px;
}
.host-row__chevron { flex: none; width: 16px; height: 16px; }
</style>
