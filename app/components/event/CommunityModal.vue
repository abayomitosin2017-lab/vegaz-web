<script setup lang="ts">
/**
 * EventCommunityModal: everyone in the event's community (decision 27 Oct;
 * NOT IN FIGMA, PROPOSED layout on the system ramp).
 * Opened by "View all" or "+N Others" in the Community section.
 * - Web: 441 card, centred. Phones: bottom sheet.
 * - Title "Community" (modal title 22/26) + count (regular Grey_2), X.
 * - List: 48 photo or letter avatar + name (16/20 regular Grey_1), rows 56
 *   tall (8 above / below), host first. The list scrolls inside the card;
 *   more people load as you reach the end (30 at a time).
 * - Tapping a person opens their profile (emits `open`).
 * Data: services/events.ts getCommunityMembers (MOCK, invented people fill
 * the list up to the count).
 */
import type { ChatPerson } from '~/types/chat'
import type { EventMember } from '~/types/event'
import { getCommunityMembers } from '~/services/events'

const props = defineProps<{ open: boolean; eventId: string; count: number }>()
const emit = defineEmits<{ close: []; open: [person: ChatPerson] }>()
const id = useId()

const members = ref<EventMember[]>([])
const total = ref(0)
const loading = ref(false)
const done = computed(() => members.value.length >= total.value && total.value > 0)
const end = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

async function loadMore() {
  if (loading.value || done.value) return
  loading.value = true
  try {
    const page = await getCommunityMembers(props.eventId, members.value.length)
    members.value.push(...page.members)
    total.value = page.total
  } finally {
    loading.value = false
  }
}

watch(() => [props.open, props.eventId], async ([open]) => {
  observer?.disconnect()
  if (!open) return
  members.value = []
  total.value = 0
  await loadMore()
  await nextTick()
  if (end.value) {
    observer = new IntersectionObserver((e) => { if (e[0]?.isIntersecting) loadMore() }, { root: end.value.parentElement, rootMargin: '200px' })
    observer.observe(end.value)
  }
}, { immediate: true })
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <UiModal :open="open" :width="441" phone="sheet" card-class="community-modal-card" :labelledby="`${id}-t`" @close="emit('close')">
    <div class="community-modal">
      <div class="community-modal__head">
        <h2 :id="`${id}-t`" class="community-modal__title text-modal-title">
          Community <span class="community-modal__count">({{ count.toLocaleString('en-GB') }})</span>
        </h2>
        <button type="button" class="community-modal__x" aria-label="Close" @click="emit('close')">
          <img src="/images/host/icon-close-16.svg" alt="" width="16" height="16" />
        </button>
      </div>
      <div class="community-modal__scroll">
        <ul class="community-modal__list" aria-label="Community members">
          <li v-for="m in members" :key="m.person.id">
            <button type="button" class="community-modal__row" @click="emit('open', m.person)">
              <UiAvatar :name="m.person.name" :seed="m.person.username" :src="m.person.avatarUrl" :size="48" />
              <span class="community-modal__name">{{ m.person.name }}</span>
            </button>
          </li>
        </ul>
        <div ref="end" class="community-modal__end" aria-hidden="true" />
        <p v-if="loading" class="community-modal__loading text-small-regular" role="status">Loading…</p>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.community-modal { display: flex; flex-direction: column; gap: var(--spacing-md); min-height: 0; }
.community-modal__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--spacing-md); }
.community-modal__title { margin: 0; color: var(--color-text-checkout); }
.community-modal__count { font-weight: var(--font-weight-regular); color: var(--color-text-secondary); }
.community-modal__x { flex: none; display: inline-flex; padding: var(--spacing-xxs); margin: calc(-1 * var(--spacing-xxs)); border: 0; border-radius: var(--radius-pill); background: none; cursor: pointer; }
.community-modal__x:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.community-modal__scroll {
  max-height: min(480px, 60vh);
  margin-inline: calc(-1 * var(--spacing-xs));
  padding-inline: var(--spacing-xs);
  overflow-y: auto;
  overscroll-behavior: contain;
}
.community-modal__list { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; }
.community-modal__row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  box-sizing: border-box;
  width: calc(100% + 2 * var(--spacing-xs)); /* photos line up with the title; hover fills 8 either side */
  padding: var(--spacing-xs);
  margin-inline: calc(-1 * var(--spacing-xs));
  border: 0;
  border-radius: var(--radius-md);
  background: none;
  text-align: left;
  cursor: pointer;
}
.community-modal__row:hover { background: var(--color-background-secondary); } /* proposed */
.community-modal__row:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: -2px; }
.community-modal__name {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  font-size: 16px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.community-modal__end { height: 1px; }
.community-modal__loading { margin: 0; padding: var(--spacing-xs) 0; color: var(--color-text-muted); text-align: center; }
@media (max-width: 767px) {
  .community-modal__scroll { max-height: 60vh; }
}
</style>
