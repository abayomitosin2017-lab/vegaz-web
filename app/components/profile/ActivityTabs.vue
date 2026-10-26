<script setup lang="ts">
import './styles.css'
import type { ActivityFilter } from '~/types/profile'
/**
 * "All / Created / Joined" pills (Figma 10834:28038), 8 apart.
 * Chosen: Primary fill, #FFFDF6 text. Others: 1px #F4F5F8 line, Grey_3 text.
 * 4 / 16 padding, radius 40, Body semibold.
 * Keyboard: a tab list (arrow keys move between tabs, as for any tabs).
 */
const model = defineModel<ActivityFilter>({ required: true })
defineProps<{ controls: string }>()
const tabs: { id: ActivityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'created', label: 'Created' },
  { id: 'joined', label: 'Joined' },
]
const list = ref<HTMLElement | null>(null)
function onKey(e: KeyboardEvent) {
  const i = tabs.findIndex(t => t.id === model.value)
  let next = i
  if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
  else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = tabs.length - 1
  else return
  e.preventDefault()
  model.value = tabs[next]!.id
  nextTick(() => list.value?.querySelectorAll<HTMLElement>('[role=tab]')[next]?.focus())
}
</script>

<template>
  <div ref="list" class="profile-tabs" role="tablist" aria-label="Show" @keydown="onKey">
    <button
      v-for="t in tabs"
      :key="t.id"
      type="button"
      role="tab"
      :class="['profile-tabs__tab text-app-body-semibold', { 'profile-tabs__tab--on': model === t.id }]"
      :aria-selected="model === t.id"
      :aria-controls="controls"
      :tabindex="model === t.id ? 0 : -1"
      @click="model = t.id"
    >{{ t.label }}</button>
  </div>
</template>

<style scoped>
.profile-tabs { display: flex; align-items: flex-start; gap: var(--spacing-xs); }
.profile-tabs__tab {
  padding: 3px 15px; /* 4 / 16 inside the 1px line */
  border: var(--border-width-default) solid var(--color-host-empty);
  border-radius: var(--radius-pill);
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-family-base);
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}
@media (hover: hover) { .profile-tabs__tab:hover:not(.profile-tabs__tab--on) { background: var(--color-host-empty); } } /* PROPOSED */
.profile-tabs__tab--on { border-color: var(--color-action-primary); background: var(--color-action-primary); color: #fffdf6; } /* #FFFDF6 raw in Figma */
.profile-tabs__tab:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
</style>
