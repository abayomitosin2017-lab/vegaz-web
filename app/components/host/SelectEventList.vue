<script setup lang="ts">
import './styles.css'
import type { HostedEventOption } from '~/types/hosting'
/**
 * Select event (Figma edition frame 01): search field (Grey_6, 0.5px Grey_5,
 * radius 40, 12 padding, 20px search icon, "Search events"), then the
 * host's events in two columns (16 apart). Item: white, 1px Grey_5 (2px
 * Primary when chosen), radius 16, padding 8 / 16 / 8 / 8; 56px photo
 * (radius 8), title Body app semibold, meta x-Small Grey_3 "place • date",
 * 24px radio on the right. The newer item look is used for every row
 * (decision 23 Oct). MOCK list: services/hosting.ts.
 */
const props = defineProps<{ events: HostedEventOption[]; loading?: boolean }>()
const picked = defineModel<string | null>({ default: null })
const query = ref('')
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? props.events.filter(e => [e.title, e.location].some(v => v.toLowerCase().includes(q))) : props.events
})
</script>

<template>
  <div class="host-select-event">
    <label class="host-select-event__search">
      <img src="/images/host/icon-search-20.svg" alt="" width="20" height="20" />
      <span class="host-visually-hidden">Search events</span>
      <input v-model="query" class="text-app-small-regular" type="search" placeholder="Search events" />
    </label>
    <p v-if="loading" class="host-select-event__empty text-app-small-regular">Loading your events…</p>
    <p v-else-if="!shown.length" class="host-select-event__empty text-app-small-regular">No events match “{{ query }}”.</p>
    <div v-else class="host-select-event__grid" role="radiogroup" aria-label="Your events">
      <label v-for="e in shown" :key="e.id" :class="['host-select-event__item', { 'host-select-event__item--on': picked === e.id }]">
        <input v-model="picked" class="host-visually-hidden" type="radio" name="edition-of" :value="e.id" />
        <span class="host-select-event__pic"><img v-if="e.imageUrl" :src="e.imageUrl" alt="" /></span>
        <span class="host-select-event__text">
          <span class="host-select-event__title text-app-body-semibold">{{ e.title }}</span>
          <span class="host-select-event__meta text-app-xsmall-regular">{{ e.location }}<span class="host-select-event__dot" aria-hidden="true" />{{ e.dateLabel }}</span>
        </span>
        <img class="host-select-event__radio" :src="picked === e.id ? '/images/auth/radio-on.svg' : '/images/auth/radio-off.svg'" alt="" width="24" height="24" />
      </label>
    </div>
  </div>
</template>

<style scoped>
.host-select-event { display: flex; flex-direction: column; gap: var(--spacing-xl); }
.host-select-event__search {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border: 0.5px solid var(--color-border-default);
  border-radius: var(--radius-pill);
  background: var(--color-background-secondary);
}
.host-select-event__search:focus-within { border-color: var(--color-border-focus); }
.host-select-event__search input { flex: 1; min-width: 0; padding: 0; border: 0; outline: none; background: transparent; color: var(--color-text-option); font-family: var(--font-family-base); }
.host-select-event__search input::placeholder { color: var(--color-text-muted); }
.host-select-event__empty { margin: 0; color: var(--color-text-secondary); }
.host-select-event__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--spacing-md); }
.host-select-event__item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: calc(var(--spacing-xs) - 1px) calc(var(--spacing-md) - 1px) calc(var(--spacing-xs) - 1px) calc(var(--spacing-xs) - 1px);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: 16px;
  background: var(--color-background-primary);
  cursor: pointer;
  transition: border-color 150ms ease;
}
.host-select-event__item:hover { border-color: var(--color-border-strong); }
.host-select-event__item--on, .host-select-event__item--on:hover { padding: calc(var(--spacing-xs) - 2px) calc(var(--spacing-md) - 2px) calc(var(--spacing-xs) - 2px) calc(var(--spacing-xs) - 2px); border: var(--border-width-emphasis) solid var(--color-action-primary); }
.host-select-event__item:has(input:focus-visible) { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }
.host-select-event__pic { flex: none; width: 56px; height: 56px; overflow: hidden; border-radius: var(--radius-sm); background: var(--color-placeholder-media); }
.host-select-event__pic img { width: 100%; height: 100%; object-fit: cover; display: block; }
.host-select-event__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--spacing-xxs); padding: 0 var(--spacing-xxs); }
.host-select-event__title { color: var(--color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.host-select-event__meta { display: flex; align-items: center; gap: var(--spacing-xs); color: var(--color-text-muted); white-space: nowrap; overflow: hidden; }
.host-select-event__dot { width: 4px; height: 4px; border-radius: 50%; background: var(--color-text-muted); flex: none; }
.host-select-event__radio { flex: none; }
@media (max-width: 767px) { .host-select-event__grid { grid-template-columns: 1fr; } }
</style>
