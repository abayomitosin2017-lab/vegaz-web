<script setup lang="ts">
import './styles.css'
import type { DraftExpectation, DraftPhoto, DraftTicket, HostedEventOption, Participants } from '~/types/hosting'
import type { HostStep } from './StepRail.vue'
import { createEvent, getCategories, getEditionBase, getTicketKinds, listHostEvents, nextEditionNumber } from '~/services/hosting'
/**
 * Host an event: the step-by-step flow (Figma section 10754:68066, desktop
 * frames edited by design 23 Oct). One component for both ways in:
 *
 *   fresh    1 Event details   photos, title, description, location,
 *                              category, participants  (frames 02-06)
 *            2 Date & tickets  date, time, tickets      (frames 07-16)
 *            3 What to expect  optional                 (frames 17-19)
 *   edition  1 Select event    the event this edition continues (E01)
 *            2 Edition details photos and the details list (E02-E05)
 *            3 Tickets                                   (E06)
 *            4 What to expect  optional
 *
 * Finishing ("Proceed" or "Skip" on the last step) publishes the event and
 * opens its page with the "Event Created" dialog (pages/events/[id].vue).
 *
 * When Continue turns on (PROPOSED, decision 23 Oct, needs product sign-off):
 *   Event / Edition details  title, at least 1 photo, location, category
 *                            (+ date and time for an edition)
 *   Date & tickets           date and time not in the past, 1+ ticket,
 *                            no ticket half-edited
 *   Tickets (edition)        1+ ticket
 *   What to expect           "Proceed" needs 1+ item; "Skip" finishes without
 * Data stays in this page only (lost on reload). MOCK publishing.
 */
const props = defineProps<{ mode: 'fresh' | 'edition' }>()
const { user } = useSession()

type StepId = 'select' | 'details' | 'tickets' | 'expect'
const steps = computed<(HostStep & { id: StepId })[]>(() => props.mode === 'fresh'
  ? [
      { id: 'details', title: 'Event details', description: 'Photos, title and description' },
      { id: 'tickets', title: 'Date & tickets', description: 'When it happens and ticket types' },
      { id: 'expect', title: 'What to expect', description: 'Highlights for your guests (optional)' },
    ]
  : [
      { id: 'select', title: 'Select event', description: 'The event this edition belongs to' },
      { id: 'details', title: 'Edition details', description: 'Photos, date and details' },
      { id: 'tickets', title: 'Tickets', description: 'Ticket types and prices' },
      { id: 'expect', title: 'What to expect', description: 'Highlights for your guests (optional)' },
    ])
const index = ref(0)
const step = computed(() => steps.value[index.value]!.id)

// ---- the draft ----
const title = ref('')
const description = ref('')
const photos = ref<DraftPhoto[]>([])
const cover = ref(0)
const date = ref('')
const time = ref('')
const location = ref('')
const category = ref<string | null>(null)
const participants = ref<Participants>('all')
const tickets = ref<DraftTicket[]>([])
const expectations = ref<DraftExpectation[]>([])
const editionOf = ref<string | null>(null)

const categories = getCategories()
const ticketKinds = getTicketKinds()
const participantLabel: Record<Participants, string> = { all: 'All Gender', female: 'Female Only', male: 'Male Only' }

// ---- edition: the host's events ----
const hostEvents = ref<HostedEventOption[]>([])
const loadingEvents = ref(props.mode === 'edition')
onMounted(async () => {
  if (props.mode === 'edition') { hostEvents.value = await listHostEvents(); loadingEvents.value = false }
})
const editionNumber = computed(() => (editionOf.value ? nextEditionNumber(editionOf.value) : '1.0'))

// ---- dialogs ----
type DialogId = 'location' | 'category' | 'participants' | 'edit-details' | 'edit-date' | null
const dialog = ref<DialogId>(null)
const deleting = ref<{ kind: 'ticket' | 'item'; id: string } | null>(null)
const editingTicket = ref<DraftTicket | null>(null)
const editingItem = ref<DraftExpectation | null>(null)

const isPast = computed(() => !!date.value && !!time.value && new Date(`${date.value}T${time.value}:00`).getTime() < Date.now())
const dateLabel = computed(() => {
  if (!date.value || !time.value) return ''
  const [y, m, d] = date.value.split('-')
  const [hh, mm] = time.value.split(':').map(Number)
  return `${d}-${m}-${y}, ${String(((hh ?? 0) % 12) || 12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${(hh ?? 0) < 12 ? 'AM' : 'PM'}`
})

const canContinue = computed(() => {
  switch (step.value) {
    case 'select': return !!editionOf.value
    case 'details': {
      const base = !!title.value.trim() && photos.value.length > 0 && !!location.value && !!category.value
      return props.mode === 'edition' ? base && !!date.value && !!time.value && !isPast.value : base
    }
    case 'tickets': {
      const dated = props.mode === 'edition' || (!!date.value && !!time.value && !isPast.value)
      return dated && tickets.value.length > 0 && !editingTicket.value
    }
    case 'expect': return expectations.value.length > 0 && !editingItem.value
  }
  return false
})

const frame = ref<{ scrollTop: () => void } | null>(null)
const busy = ref(false)

async function next() {
  if (step.value === 'select' && editionOf.value) {
    const base = await getEditionBase(editionOf.value)
    if (base && !title.value) { title.value = base.title; description.value = base.about }
  }
  if (index.value < steps.value.length - 1) {
    index.value += 1
    nextTick(() => frame.value?.scrollTop())
  } else await publish()
}
function back() {
  if (index.value === 0) return navigateTo('/host')
  index.value -= 1
  nextTick(() => frame.value?.scrollTop())
}
async function publish(skipExpect = false) {
  if (!user.value || busy.value) return
  busy.value = true
  const id = await createEvent({
    title: title.value,
    description: description.value,
    photos: photos.value,
    coverIndex: cover.value,
    date: date.value,
    time: time.value,
    location: location.value,
    category: category.value,
    participants: participants.value,
    tickets: tickets.value,
    expectations: skipExpect ? [] : expectations.value,
    editionOf: editionOf.value ?? undefined,
  }, user.value)
  busy.value = false
  await navigateTo({ path: `/events/${id}`, query: { created: '1' } })
}

// ---- tickets ----
function addTicket(t: DraftTicket) { tickets.value = [...tickets.value, t] }
function saveTicket(t: DraftTicket) {
  tickets.value = tickets.value.map(x => (x.id === t.id ? t : x))
  editingTicket.value = null
}
function startEditTicket(t: DraftTicket) { editingTicket.value = t; nextTick(() => frame.value?.scrollTop()) }
// ---- what to expect ----
function addItem(i: DraftExpectation) { expectations.value = [...expectations.value, i] }
function saveItem(i: DraftExpectation) {
  expectations.value = expectations.value.map(x => (x.id === i.id ? i : x))
  editingItem.value = null
}
function confirmDelete() {
  const d = deleting.value
  if (!d) return
  if (d.kind === 'ticket') {
    tickets.value = tickets.value.filter(t => t.id !== d.id)
    if (editingTicket.value?.id === d.id) editingTicket.value = null
  } else {
    expectations.value = expectations.value.filter(i => i.id !== d.id)
    if (editingItem.value?.id === d.id) editingItem.value = null
  }
  deleting.value = null
}

const headers: Record<StepId, { title: string; copy: string }> = {
  select: { title: 'Select event', copy: 'Pick the event this new edition belongs to. Its chat room and members carry over.' },
  details: props.mode === 'fresh'
    ? { title: 'Event details', copy: 'Add photos and tell people what your event is about.' }
    : { title: 'Edition details', copy: 'Any detail you create will be linked to the chat and members for the selected event.' },
  tickets: props.mode === 'fresh'
    ? { title: 'Date & tickets', copy: 'Set when your event happens, then add the tickets guests can buy.' }
    : { title: 'Tickets', copy: 'Add the tickets guests can buy for this edition.' },
  expect: { title: 'What to expect', copy: 'To boost engagement and conversion, create a list of experience your guest should expect at the event.' },
}
const isLast = computed(() => index.value === steps.value.length - 1)
const id = useId()
</script>

<template>
  <HostFrame
    ref="frame"
    :can-continue="canContinue"
    :busy="busy"
    :continue-label="step === 'select' ? 'Create New Edition' : isLast ? 'Proceed' : 'Continue'"
    :continue-width="step === 'select' ? 220 : 180"
    :skip-label="isLast ? 'Skip' : undefined"
    @back="back"
    @continue="next"
    @skip="publish(true)"
  >
    <template #rail>
      <HostStepRail :title="mode === 'fresh' ? 'Create new event' : 'Create new edition'" :steps="steps" :current="index" />
    </template>

    <div class="host-step-head">
      <h2 class="host-step-head__title text-h3-bold">{{ headers[step].title }}</h2>
      <p class="host-step-head__copy text-small-regular">{{ headers[step].copy }}</p>
    </div>

    <!-- Edition 1: Select event -->
    <HostSelectEventList v-if="step === 'select'" v-model="editionOf" :events="hostEvents" :loading="loadingEvents" />

    <!-- Event / Edition details -->
    <div v-else-if="step === 'details'" class="host-details-step">
      <div class="host-details-step__fields">
        <template v-if="mode === 'fresh'">
          <div class="host-details-step__text">
            <div class="host-field">
              <label :for="`${id}-title`" class="host-field__label text-app-small-semibold">Title</label>
              <input :id="`${id}-title`" v-model="title" class="host-input" type="text" maxlength="60" placeholder="What is your event title?" />
            </div>
            <div class="host-field">
              <label :for="`${id}-desc`" class="host-field__label text-app-small-semibold">Description</label>
              <textarea :id="`${id}-desc`" v-model="description" class="host-input host-details-step__desc" placeholder="Share some exciting and memorable words about your event!" />
            </div>
          </div>
          <HostDetailsList heading="Details">
            <HostDetailsRow icon="location" label="Location" :value="location || undefined" @open="dialog = 'location'" />
            <HostDetailsRow icon="categories" label="Categories" :value="category ?? undefined" @open="dialog = 'category'" />
            <HostDetailsRow icon="participants" label="Participants" :value="participantLabel[participants]" @open="dialog = 'participants'" />
          </HostDetailsList>
        </template>
        <HostDetailsList v-else heading="Edit Details">
          <HostDetailsRow icon="event-details" label="Event Details" :value="title || undefined" @open="dialog = 'edit-details'" />
          <HostDetailsRow icon="date-time" label="Date & Time" :value="dateLabel || undefined" edit @open="dialog = 'edit-date'" />
          <HostDetailsRow icon="edition" label="Edition" :value="editionNumber" :clickable="false" />
          <HostDetailsRow icon="location" label="Location" :value="location || undefined" @open="dialog = 'location'" />
          <HostDetailsRow icon="categories" label="Categories" :value="category ?? 'Select'" @open="dialog = 'category'" />
          <HostDetailsRow icon="participants" label="Participants" :value="participantLabel[participants]" @open="dialog = 'participants'" />
        </HostDetailsList>
        <p v-if="mode === 'edition' && isPast" class="host-details-step__error text-app-small-regular" role="alert">You cannot choose a past time.</p>
      </div>
      <HostPhotoPicker v-model:photos="photos" v-model:cover="cover" />
    </div>

    <!-- Date & tickets / Tickets -->
    <template v-else-if="step === 'tickets'">
      <template v-if="mode === 'fresh'">
        <HostDateTimeFields v-model:date="date" v-model:time="time" />
        <hr class="host-divider" />
      </template>
      <HostTicketForm :kinds="ticketKinds" :editing="editingTicket" @add="addTicket" @save="saveTicket" @cancel="editingTicket = null" />
    </template>

    <!-- What to expect -->
    <HostExpectForm v-else-if="step === 'expect'" :editing="editingItem" @add="addItem" @save="saveItem" @cancel="editingItem = null" />

    <template v-if="step === 'tickets'" #side>
      <HostTicketsPanel :tickets="tickets" :editing-id="editingTicket?.id ?? null" @edit="startEditTicket" @delete="t => (deleting = { kind: 'ticket', id: t.id })" />
    </template>
    <template v-else-if="step === 'expect'" #side>
      <HostExpectPanel :items="expectations" :editing-id="editingItem?.id ?? null" @edit="i => (editingItem = i)" @delete="i => (deleting = { kind: 'item', id: i.id })" />
    </template>
  </HostFrame>

  <HostLocationDialog :open="dialog === 'location'" :value="location" @close="dialog = null" @save="v => { location = v; dialog = null }" />
  <HostCategoryDialog :open="dialog === 'category'" :value="category" :options="categories" @close="dialog = null" @save="v => { category = v; dialog = null }" />
  <HostParticipantsDialog :open="dialog === 'participants'" :value="participants" @close="dialog = null" @save="v => { participants = v; dialog = null }" />
  <HostEditDetailsDialog :open="dialog === 'edit-details'" :title="title" :description="description" @close="dialog = null" @save="v => { title = v.title; description = v.description; dialog = null }" />
  <HostEditDateDialog :open="dialog === 'edit-date'" :date="date" :time="time" @close="dialog = null" @save="v => { date = v.date; time = v.time; dialog = null }" />
  <HostDeleteDialog
    :open="!!deleting"
    :title="deleting?.kind === 'item' ? 'Delete Item' : 'Delete Ticket'"
    :copy="deleting?.kind === 'item' ? 'Are you sure you want to delete this item?' : 'Are you sure you want to delete this ticket?'"
    @close="deleting = null"
    @confirm="confirmDelete"
  />
</template>

<style scoped>
.host-details-step { display: flex; gap: var(--spacing-3xl); align-items: flex-start; }
.host-details-step__fields { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: var(--spacing-lg); }
.host-details-step__text { display: flex; flex-direction: column; gap: var(--spacing-md); }
.host-details-step__desc { height: 122px; }
.host-details-step__error { margin: 0; color: var(--color-host-danger); }
.host-divider { width: 100%; height: 1px; margin: 0; border: 0; background: var(--color-border-default); }
/* Narrow screens (no design): photos go under the fields */
@media (max-width: 1279px) {
  .host-details-step { flex-direction: column; align-items: stretch; gap: var(--spacing-xl); }
}
</style>
