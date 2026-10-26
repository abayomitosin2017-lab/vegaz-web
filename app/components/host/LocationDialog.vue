<script setup lang="ts">
import './styles.css'
import type { PlaceSuggestion } from '~/types/hosting'
import { searchPlaces } from '~/services/hosting'
/**
 * Location (Figma frame 04). Search field (MapPin 16, Small app semibold),
 * grey note "Exact location will be visible to only participants" 8px
 * below, then suggestions (MapPin 16 Grey_4, Small app semibold Grey_1,
 * 1px Grey_5 lines, 16 apart), then "Done".
 * Picking a suggestion fills the field; "Done" keeps what is typed even if
 * no suggestion was picked. MOCK suggestions (services/hosting.ts).
 */
const props = defineProps<{ open: boolean; value: string }>()
const emit = defineEmits<{ close: []; save: [value: string] }>()

const query = ref('')
const results = ref<PlaceSuggestion[]>([])
watch(() => props.open, o => { if (o) { query.value = props.value; results.value = [] } })

let timer: ReturnType<typeof setTimeout> | undefined
watch(query, q => {
  clearTimeout(timer)
  timer = setTimeout(async () => { results.value = await searchPlaces(q) }, 150)
})

function choose(p: PlaceSuggestion) {
  query.value = p.label
  emit('save', p.label)
}
function done() {
  if (query.value.trim()) emit('save', query.value.trim())
}
</script>

<template>
  <HostDialog :open="open" title="Location" copy="Enter the location where your event will be holding" @close="emit('close')">
    <div class="host-loc">
      <label class="host-loc__field">
        <span class="host-visually-hidden">Location</span>
        <img src="/images/host/icon-mappin-field-16.svg" alt="" width="16" height="16" />
        <input v-model="query" class="host-loc__input text-app-small-semibold" type="text" placeholder="Search for a location" autocomplete="off" data-autofocus @keydown.enter.prevent="done" />
      </label>
      <p class="host-note text-app-xsmall-regular">Exact location will be visible to only participants</p>
    </div>
    <ul v-if="results.length" class="host-loc__list" aria-label="Suggestions">
      <li v-for="p in results" :key="p.id">
        <button type="button" class="host-loc__item text-app-small-semibold" @click="choose(p)">
          <img src="/images/host/icon-mappin-16.svg" alt="" width="16" height="16" />
          <span>{{ p.label }}</span>
        </button>
      </li>
    </ul>
    <UiButton :class="{ 'host-inactive': !query.trim() }" :color="query.trim() ? 'primary' : 'secondary'" :aria-disabled="!query.trim() ? 'true' : undefined" @click="done">Done</UiButton>
  </HostDialog>
</template>

<style scoped>
.host-loc { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.host-loc__field {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: calc(var(--spacing-field) - var(--border-width-default)) calc(var(--spacing-md) - var(--border-width-default));
  border: var(--border-width-default) solid var(--color-host-field-border);
  border-radius: var(--radius-md);
  background: var(--color-background-primary);
  transition: border-color 150ms ease;
}
.host-loc__field:focus-within { border-color: var(--color-border-focus); }
.host-loc__input { flex: 1; min-width: 0; padding: 0; border: 0; outline: none; background: transparent; color: var(--color-text-option); font-family: var(--font-family-base); }
.host-loc__input::placeholder { color: var(--color-text-placeholder-subtle); font-weight: var(--font-weight-regular); }
.host-loc__list { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; }
.host-loc__list li { border-bottom: var(--border-width-default) solid var(--color-border-default); }
.host-loc__item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-xs) 0;
  border: 0;
  background: none;
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  text-align: left;
  cursor: pointer;
}
.host-loc__item img { margin-top: 2px; flex: none; }
.host-loc__item:hover span { color: var(--color-action-primary); }
.host-loc__item:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); border-radius: var(--radius-xs); }
</style>
