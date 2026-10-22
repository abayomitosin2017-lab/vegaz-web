<script setup lang="ts">
/**
 * LayoutSearchBox: the header's "Search for events" field with a suggestions
 * list (decision 22 Oct; results page not designed yet).
 *
 * Field: the existing UiInput pill (Figma header search).
 * Suggestions (NOT IN FIGMA, proposed, profile-menu style): white card,
 * Dp2 shadow, radius 24, 8px above/below, opening 8px under the field.
 * Each row: 48px event flier (radius 8), title (Web Small semibold) over
 * "place · date" (x-Small regular Grey_3). Up to 6 matches on title, place or
 * category; "No events found" when nothing matches.
 *
 * Keyboard (combobox pattern): typing opens the list; Up/Down move through
 * it; Enter opens the highlighted event (or the first match); Escape closes
 * the list (a second Escape is left to the parent, e.g. to close the phone
 * search bar). Choosing an event goes to its details page and clears the
 * field.
 */
import type { EventSummary } from '~/types/event'
import { searchEvents } from '~/services/events'

defineOptions({ inheritAttrs: false })
const emit = defineEmits<{ chosen: [] }>()

// Shared by the desktop field and the phone search bar, so what you typed
// is kept when the phone bar closes and opens again (decision 21 Oct)
const query = useState('header-search-query', () => '')
const results = ref<EventSummary[]>([])
const open = ref(false)
const active = ref(-1)
const listId = useId()
const root = ref<HTMLElement | null>(null)

let timer: ReturnType<typeof setTimeout> | undefined
let lastRequest = 0
watch(query, (q) => {
  clearTimeout(timer)
  active.value = -1
  if (!q.trim()) { results.value = []; open.value = false; return }
  timer = setTimeout(async () => {
    const request = ++lastRequest
    const found = await searchEvents(q)
    if (request !== lastRequest) return // an older search finished late
    results.value = found
    open.value = true
  }, 120)
})

function choose(e: EventSummary) {
  open.value = false
  query.value = ''
  emit('chosen')
  navigateTo(`/events/${e.id}`)
}
function submit() {
  const pick = results.value[active.value] ?? results.value[0]
  if (pick) choose(pick)
  else if (query.value.trim()) open.value = true // shows "No events found"
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!results.value.length) return
    e.preventDefault()
    open.value = true
    const n = results.value.length
    active.value = e.key === 'ArrowDown' ? (active.value + 1) % n : (active.value - 1 + n) % n
  } else if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    e.stopPropagation()
    open.value = false
  }
}
// Close when focus or a tap goes elsewhere
function onFocusOut(e: FocusEvent) {
  if (!root.value?.contains(e.relatedTarget as Node)) open.value = false
}
onBeforeUnmount(() => clearTimeout(timer))

defineExpose({ focus: () => root.value?.querySelector('input')?.focus() })
</script>

<template>
  <form ref="root" class="search-box" role="search" v-bind="$attrs" @submit.prevent="submit" @focusout="onFocusOut">
    <UiInput
      v-model="query"
      type="search"
      text-style="web"
      placeholder="Search for events"
      aria-label="Search for events"
      action-label="Search"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="listId"
      :aria-activedescendant="open && active >= 0 ? `${listId}-${active}` : undefined"
      autocomplete="off"
      @keydown="onKeydown"
      @focus="results.length && (open = true)"
      @action="submit"
    >
      <template #action>
        <img src="/images/icon-search.svg" alt="" width="20" height="20" />
      </template>
    </UiInput>

    <div v-show="open" class="search-box__panel">
      <ul v-if="results.length" :id="listId" class="search-box__list" role="listbox" aria-label="Matching events">
        <li
          v-for="(e, i) in results"
          :id="`${listId}-${i}`"
          :key="e.id"
          role="option"
          :aria-selected="i === active"
          :class="['search-box__option', { 'search-box__option--active': i === active }]"
          @mousedown.prevent
          @click="choose(e)"
          @mousemove="active = i"
        >
          <span class="search-box__photo"><img v-if="e.imageUrl" :src="e.imageUrl" alt="" /></span>
          <span class="search-box__text">
            <span class="search-box__title text-small-semibold">{{ e.title }}</span>
            <span class="search-box__meta text-xsmall-regular">{{ e.location }} · {{ e.dateLabel }}</span>
          </span>
        </li>
      </ul>
      <p v-else :id="listId" class="search-box__empty text-small-regular" role="status">No events found</p>
    </div>
  </form>
</template>

<style scoped>
.search-box { position: relative; min-width: 0; }
.search-box__panel {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  left: 0;
  right: 0;
  z-index: 40;
  min-width: 280px;
  padding-block: var(--spacing-xs);
  border-radius: var(--radius-lg);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-dp2);
  overflow: hidden;
}
.search-box__list { margin: 0; padding: 0; list-style: none; }
.search-box__option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
}
.search-box__option--active { background: var(--color-background-secondary); }
.search-box__photo {
  flex: none;
  width: var(--sizing-control-standard);
  height: var(--sizing-control-standard);
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--color-placeholder-media);
}
.search-box__photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.search-box__text { display: flex; flex-direction: column; min-width: 0; }
.search-box__title,
.search-box__meta { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.search-box__title { color: var(--color-text-primary); }
.search-box__meta { color: var(--color-text-muted); }
.search-box__empty { margin: 0; padding: var(--spacing-xs) var(--spacing-md); color: var(--color-text-muted); }
</style>
