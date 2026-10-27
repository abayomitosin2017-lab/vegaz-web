<script setup lang="ts">
/**
 * LayoutMobileSearch: phone search (decision 27 Oct; NOT IN FIGMA, PROPOSED,
 * Airbnb-style). Replaces the search bar that opened inside the header.
 * Full screen, white:
 * - Top row (16 page margin): the search pill (same field as the desktop
 *   header, no clear x inside), then the close X on the right (40 tap area,
 *   20px icon, no background; decision 27 Oct).
 * - Before typing: "Suggested events" (Small semibold Grey_2) and up to 6
 *   events happening this week.
 * - While typing: up to 6 matches on title, place or category, or
 *   "No events found".
 * - Rows: 48 flier (radius 8), title (Small semibold Grey_1) over
 *   "place · date" (x-Small regular Grey_3); tap opens the event.
 * - Search / Enter: the All events page with the results ("?q=").
 * X, Escape or the phone's back closes it; what was typed is kept.
 */
import type { EventSummary } from '~/types/event'
import { getHomeEvents, searchEvents } from '~/services/events'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const id = useId()

// Shared with the desktop field, so what was typed is kept
const query = useState('header-search-query', () => '')
const results = ref<EventSummary[]>([])
const suggested = ref<EventSummary[]>([])
const searched = ref(false)

let timer: ReturnType<typeof setTimeout> | undefined
let lastRequest = 0
function search(q: string) {
  clearTimeout(timer)
  if (!q.trim()) { results.value = []; searched.value = false; return }
  timer = setTimeout(async () => {
    const request = ++lastRequest
    const found = await searchEvents(q)
    if (request !== lastRequest) return
    results.value = found
    searched.value = true
  }, 120)
}
watch(query, search)
watch(() => props.open, async (o) => {
  if (!o) return
  search(query.value)
  if (!suggested.value.length) suggested.value = (await getHomeEvents()).happeningThisWeek.slice(0, 6)
}, { immediate: true })
onBeforeUnmount(() => clearTimeout(timer))

const typing = computed(() => !!query.value.trim())
const list = computed(() => (typing.value ? results.value : suggested.value))

function choose(e: EventSummary) {
  query.value = ''
  emit('close')
  navigateTo(`/events/${e.id}`)
}
function submit() {
  const q = query.value.trim()
  if (!q) return
  emit('close')
  navigateTo({ path: '/events', query: { q } })
}
</script>

<template>
  <UiModal :open="open" phone="fullscreen" card-class="m-search-card" :labelledby="`${id}-t`" @close="emit('close')">
    <div class="m-search">
      <h2 :id="`${id}-t`" class="m-search__sr">Search events</h2>
      <form class="m-search__bar" role="search" @submit.prevent="submit">
        <UiInput
          v-model="query"
          type="search"
          text-style="web"
          class="m-search__field"
          placeholder="Search for events"
          aria-label="Search for events"
          action-label="Search"
          autocomplete="off"
          enterkeyhint="search"
          data-autofocus
          @action="submit"
        >
          <template #action><img src="/images/icon-search.svg" alt="" width="16" height="16" /></template>
        </UiInput>
        <button type="button" class="m-search__close" aria-label="Close search" @click="emit('close')">
          <img src="/images/chat/icon-close-20.svg" alt="" width="20" height="20" />
        </button>
      </form>

      <div class="m-search__body">
        <p v-if="!typing" class="m-search__label text-small-semibold">Suggested events</p>
        <ul v-if="list.length" class="m-search__list" :aria-label="typing ? 'Matching events' : 'Suggested events'">
          <li v-for="e in list" :key="e.id">
            <button type="button" class="m-search__row" @click="choose(e)">
              <span class="m-search__photo"><img v-if="e.imageUrl" :src="e.imageUrl" alt="" /></span>
              <span class="m-search__text">
                <span class="m-search__title text-small-semibold">{{ e.title }}</span>
                <span class="m-search__meta text-xsmall-regular">{{ e.location }} · {{ e.dateLabel }}</span>
              </span>
            </button>
          </li>
        </ul>
        <p v-else-if="typing && searched" class="m-search__empty text-small-regular" role="status">No events found</p>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.m-search { display: flex; flex-direction: column; min-height: 100%; }
.m-search__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.m-search__bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: calc(var(--spacing-md) + env(safe-area-inset-top, 0px)) var(--container-inset-mobile) var(--spacing-md);
  border-bottom: var(--border-width-default) solid var(--color-border-default);
}
.m-search__close {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-pill);
  background: none; /* no grey circle behind icons (decision 27 Oct) */
  cursor: pointer;
}
.m-search__close:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.m-search__field { flex: 1; min-width: 0; }
/* No clear (x) inside the field; the close X sits beside it (decision 27 Oct) */
.m-search__field :deep(.ui-input__field)::-webkit-search-cancel-button { display: none; }
.m-search__body { display: flex; flex-direction: column; gap: var(--spacing-xs); padding: var(--spacing-md) var(--container-inset-mobile) calc(var(--spacing-2xl) + env(safe-area-inset-bottom, 0px)); }
.m-search__label { margin: 0; color: var(--color-text-secondary); }
.m-search__list { display: flex; flex-direction: column; margin: 0 calc(-1 * var(--spacing-xs)); padding: 0; list-style: none; }
.m-search__row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-xs);
  border: 0;
  border-radius: var(--radius-md);
  background: none;
  text-align: left;
  cursor: pointer;
}
.m-search__row:active { background: var(--color-background-secondary); }
.m-search__row:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: -2px; }
.m-search__photo { flex: none; width: 48px; height: 48px; overflow: hidden; border-radius: var(--radius-sm); background: var(--color-placeholder-media); }
.m-search__photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.m-search__text { display: flex; flex-direction: column; min-width: 0; }
.m-search__title, .m-search__meta { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.m-search__title { color: var(--color-text-primary); }
.m-search__meta { color: var(--color-text-muted); }
.m-search__empty { margin: 0; padding: var(--spacing-xs) 0; color: var(--color-text-muted); }
</style>

<style>
/* Full screen and edge to edge: the parts set their own padding */
.ui-modal .ui-modal__card.m-search-card.m-search-card { padding: 0; background: var(--color-background-primary); }
</style>
