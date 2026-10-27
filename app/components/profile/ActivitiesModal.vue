<script setup lang="ts">
import './styles.css'
import type { ActivityFilter, ActivityItem } from '~/types/profile'
import { listActivities } from '~/services/profile'
/**
 * Activities: opened from the profile menu's "My Activities".
 *
 * Web (Figma web section 10838:19056): 560px white modal, radius 24,
 * padding 24 / 24 / 32, 24 between parts: "Activities" (Headline 2 bold
 * #141316) with a 16px X; the pills; the list in two groups, "Upcoming" and
 * "Past" (Body semibold Grey_3), a 0.5px Grey_5 line and 16 between them.
 * Phones (Figma mobile 10834:28021): full screen. Back circle + centred
 * "Activities"; pills 91 below; rows 18 below the pills, one list (upcoming
 * first, then past), as drawn.
 * Empty tab (PROPOSED, web frames): grey box with the list drawing,
 * "You haven't created / joined an event yet", a line of help, and
 * "Host an Event" / "Explore Events".
 * Rows open the event page and close Activities.
 */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; host: [] }>()
const { user } = useSession()
const isPhone = usePhoneLayout()
const id = useId()

const filter = ref<ActivityFilter>('all')
const items = ref<ActivityItem[] | null>(null)
const failed = ref(false)

async function load() {
  if (!user.value) return
  items.value = null
  failed.value = false
  try { items.value = await listActivities(user.value) }
  catch { failed.value = true }
}
watch(() => props.open, o => { if (o) { filter.value = 'all'; load() } }, { immediate: true })

const shown = computed(() => (items.value ?? []).filter(i => filter.value === 'all' || i.role === filter.value))
const upcoming = computed(() => shown.value.filter(i => !i.ended))
const past = computed(() => shown.value.filter(i => i.ended))

const empty = computed(() => filter.value === 'joined'
  ? { title: "You haven't joined an event yet", copy: 'Events you join will show up here.', cta: 'Explore Events' }
  : filter.value === 'created'
    ? { title: "You haven't created an event yet", copy: 'Host your first event and it will show up here.', cta: 'Host an Event' }
    : { title: 'No activities yet', copy: 'Events you create or join will show up here.', cta: 'Explore Events' })

function onCta() {
  emit('close')
  if (filter.value === 'created') emit('host')
  else navigateTo('/events')
}
</script>

<template>
  <UiModal :open="open" :width="560" phone="fullscreen" card-class="profile-act-card" :labelledby="`${id}-t`" @close="emit('close')">
    <div class="profile-act">
      <div v-if="isPhone" class="profile-mbar profile-act__mbar">
        <UiBackButton class="profile-back" @click="emit('close')" />
        <h2 :id="`${id}-t`" class="profile-mbar__title text-app-body-semibold">Activities</h2>
      </div>
      <div v-else class="profile-act__head">
        <h2 :id="`${id}-t`" class="profile-act__title text-app-h2-bold">Activities</h2>
        <button type="button" class="profile-close" aria-label="Close" @click="emit('close')">
          <img src="/images/host/icon-close-16.svg" alt="" width="16" height="16" />
        </button>
      </div>

      <div class="profile-act__body">
        <ProfileActivityTabs v-model="filter" :controls="`${id}-p`" />

        <div :id="`${id}-p`" class="profile-act__panel" role="tabpanel" :aria-labelledby="`${id}-t`" :aria-busy="items === null && !failed ? 'true' : undefined">
          <p v-if="failed" class="profile-act__note text-app-small-regular" role="alert">
            We couldn't load your activities. <button type="button" class="profile-act__retry" @click="load">Try again</button>
          </p>
          <p v-else-if="items === null" class="profile-act__note text-app-small-regular">Loading…</p>

          <div v-else-if="!shown.length" class="profile-act__empty">
            <img src="/images/host/empty-list.svg" alt="" width="95" height="75" />
            <div class="profile-act__empty-text">
              <p class="profile-act__empty-title text-app-small-semibold">{{ empty.title }}</p>
              <p class="profile-act__empty-copy text-app-small-regular">{{ empty.copy }}</p>
            </div>
            <UiButton class="profile-act__cta" @click="onCta">{{ empty.cta }}</UiButton>
          </div>

          <ul v-else-if="isPhone" class="profile-act__list" aria-label="Events">
            <li v-for="i in shown" :key="i.eventId"><ProfileActivityRow :item="i" @open="emit('close')" /></li>
          </ul>

          <template v-else>
            <section v-if="upcoming.length" class="profile-act__group" :aria-labelledby="`${id}-u`">
              <h3 :id="`${id}-u`" class="profile-act__label text-app-body-semibold">Upcoming</h3>
              <ul class="profile-act__list">
                <li v-for="i in upcoming" :key="i.eventId"><ProfileActivityRow :item="i" @open="emit('close')" /></li>
              </ul>
            </section>
            <hr v-if="upcoming.length && past.length" class="profile-rule profile-act__rule" />
            <section v-if="past.length" class="profile-act__group" :aria-labelledby="`${id}-x`">
              <h3 :id="`${id}-x`" class="profile-act__label text-app-body-semibold">Past</h3>
              <ul class="profile-act__list">
                <li v-for="i in past" :key="i.eventId"><ProfileActivityRow :item="i" @open="emit('close')" /></li>
              </ul>
            </section>
          </template>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.profile-act { display: flex; flex-direction: column; gap: var(--spacing-lg); min-height: 0; max-height: calc(100dvh - 2 * var(--spacing-4xl) - var(--spacing-lg) - var(--spacing-xl)); }
.profile-act__head { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-md); }
.profile-act__title { margin: 0; color: var(--color-text-checkout); }
.profile-act__body { display: flex; flex-direction: column; gap: var(--spacing-lg); min-height: 0; flex: 1 1 auto; }
/* the list scrolls inside the card; title and pills stay put (long lists, not drawn) */
.profile-act__panel { display: flex; flex-direction: column; min-height: 0; overflow-y: auto; overscroll-behavior: contain; margin: 0 calc(-1 * var(--spacing-xs)); padding: 0 var(--spacing-xs); }
.profile-act__list { margin: 0; padding: 0; list-style: none; }
.profile-act__group { display: flex; flex-direction: column; }
.profile-act__label { margin: 0; color: var(--color-text-muted); }
.profile-act__rule { margin-bottom: var(--spacing-md); }
.profile-act__note { margin: 0; padding: var(--spacing-lg) 0; color: var(--color-text-muted); text-align: center; }
.profile-act__retry { padding: 0; border: 0; background: none; color: var(--color-action-primary); font: inherit; text-decoration: underline; cursor: pointer; }

.profile-act__empty {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl) 44px;
  border-radius: 16px;
  background: var(--color-host-empty);
  text-align: center;
}
.profile-act__empty-text { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.profile-act__empty-title { margin: 0; color: var(--color-text-option); }
.profile-act__empty-copy { margin: 0; color: var(--color-text-muted); }

@media (max-width: 767px) {
  .profile-act { max-height: none; height: 100dvh; box-sizing: border-box; gap: 0; padding: calc(16px + env(safe-area-inset-top, 0px)) var(--spacing-md) calc(var(--spacing-lg) + env(safe-area-inset-bottom, 0px)); }
  .profile-act__body { gap: 18px; margin-top: 55px; }
}
</style>

<style>
/* Web: 24 / 24 / 32 padding (Figma web frame). Phones: full screen, no padding. */
.ui-modal .ui-modal__card.profile-act-card.profile-act-card { padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-xl); }
@media (max-width: 767px) {
  .ui-modal .ui-modal__card.profile-act-card.profile-act-card { padding: 0; }
}
</style>
