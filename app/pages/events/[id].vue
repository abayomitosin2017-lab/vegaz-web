<script setup lang="ts">
/**
 * Event details (Figma section "event details", 10715:65072; gallery update
 * 10724:67468).
 *
 * Desktop (>= 1024px, Desktop 64/65/66): 1140px column, 62px under the header.
 *   Title row: title (40/48 bold) + "Join Community - Free" (secondary,
 *   Grey_5 line, 32px sides, + icon). 40px below: gallery. 40px below: two
 *   columns, 601px left (sections 48px apart) and the 431px ticket panel on
 *   the right, which stays in view while scrolling (decision 22 Oct).
 * Phones and tablets (< 1024px, Figma phone frames; tablet decision 22 Oct):
 *   one column, sections 40px apart, in this order: title, gallery, facts +
 *   (phones: gallery first, then the title 24px below; decision 22 Oct),
 *   host, tickets, About, What to expect, "Not ready to buy a ticket?" card,
 *   Community, line, app banner. Once a ticket is picked a bar with the total
 *   and Buy Ticket stays at the bottom of the screen.
 *
 * Behaviour (decisions 22 Oct):
 * - Already in the event's chat (decision 22 Oct): the button reads "Open
 *   Chat" (no + icon) and the phone "Not ready to buy a ticket?" card hides.
 * - Holding a ticket (decision 22 Oct): "Share Event" under the tickets;
 *   more tickets can still be bought for others.
 * - Join Community: signed out -> Login or signup first; then the event's
 *   chat opens.
 * - Buy Ticket: opens the buy ticket flow (CheckoutFlow; decisions 22 Oct).
 * - Photo -> full-size viewer. "Hosted by" tag -> profile panel (community
 *   people are not clickable, decision 22 Oct)
 *   (desktop: side panel; phones: full screen). Invite Friend -> share.
 * - Copy icon -> copies the address, "Address copied".
 * - Empty sections are hidden (decision 27 Oct): About Event with no
 *   description, What to expect with no items, Community under COMMUNITY_MIN
 *   (10) people. The "Not ready to buy a ticket?" block stays.
 * - Host of this event: "Finish setting up in the Vegaz app" modal on each
 *   visit (HostAppModal, decision 27 Oct).
 * Copy: "About Hangout" -> "About Event" (Hangouts -> Events rule).
 */
import type { ChatPerson, ChatProfile } from '~/types/chat'
import { getEvent } from '~/services/events'
import { getTicketTypes } from '~/services/tickets'
import { getProfile, isInEventChat, joinEventChat, sendMessage } from '~/services/chat'
import { saveBio } from '~/services/profile'
import { ticketsHeld } from '~/services/tickets'
import { priceRange } from '~/utils/money'
import { COMMUNITY_MIN } from '~/config/event'

const route = useRoute()
const id = computed(() => String(route.params.id))

const { data: event } = await useAsyncData(`event-${id.value}`, () => getEvent(id.value), { watch: [id] })
const { data: tickets } = await useAsyncData(`tickets-${id.value}`, () => getTicketTypes(id.value), { watch: [id], default: () => [] })

useHead(() => ({ title: event.value ? `${event.value.title} · Vegaz` : 'Event not found · Vegaz' }))

// ---- Sections shown (empty ones hide, decision 27 Oct) ----
const showAbout = computed(() => !!event.value?.about?.trim())
const showExpect = computed(() => !!event.value?.expectations?.length)
const showCommunity = computed(() => (event.value?.communityCount ?? 0) >= COMMUNITY_MIN)
// Desktop: the ticket panel spans the left column's visible sections
// (details, banner + the optional ones)
const leftRows = computed(() => 2 + Number(showAbout.value) + Number(showExpect.value) + Number(showCommunity.value))

// ---- Add to calendar (decision 27 Oct) ----
const calendarEvent = computed(() => event.value && ({ title: event.value.title, startsAt: event.value.startsAt, location: event.value.address, details: event.value.about ?? '', url: eventUrl(event.value.id) }))

// ---- Tickets ----
const quantities = ref<Record<string, number>>({})
watch(tickets, (list) => { quantities.value = Object.fromEntries((list ?? []).map(t => [t.id, 0])) }, { immediate: true })
const picked = computed(() => (tickets.value ?? []).filter(t => (quantities.value[t.id] ?? 0) > 0))
const count = computed(() => picked.value.reduce((n, t) => n + (quantities.value[t.id] ?? 0), 0))
const total = computed(() => picked.value.reduce((sum, t) => sum + t.price * (quantities.value[t.id] ?? 0), 0))
const price = computed(() => priceRange((tickets.value ?? []).map(t => t.price)))
// Buy Ticket opens the checkout (Figma 10713:56670, decisions 22 Oct)
const checkoutOpen = ref(false)
// Tickets the signed-in user holds for this event, and whether they're in its chat
const holding = ref(0)
// The signed-in user hosts this event (they created it): their main action is
// to open its chat, not to join or buy (decision 26 Oct)
const isHost = computed(() => !!user.value && !!event.value && event.value.host.username === user.value.username)
const inChat = ref(false)
async function refreshStatus() {
  holding.value = ticketsHeld(user.value?.email, id.value)
  inChat.value = user.value ? await isInEventChat(user.value.username, id.value) : false
}
function buy() {
  if (count.value > 0) checkoutOpen.value = true
}

// ---- Join the community -> open its chat ----
const { user, setUser } = useSession()
const { open: openAuth, isOpen: authOpen } = useAuthModal()
const joining = ref(false)
let joinAfterLogin = false
async function join() {
  if (!event.value) return
  if (!user.value) {
    joinAfterLogin = true
    openAuth()
    return
  }
  // First time in this event's chat (hosts excluded): the intro box opens,
  // filled in with their bio (decision 27 Oct, replaces 26 Oct)
  const firstTime = !isHost.value && !(await isInEventChat(user.value.username, event.value.id))
  if (firstTime) {
    bioOpen.value = true
    return
  }
  await enterChat()
}
/** Joins the chat; `intro` = the message they wrote, posted as typed */
async function enterChat(intro?: string) {
  const u = user.value
  if (!u || !event.value) return
  joining.value = true
  try {
    const chatId = await joinEventChat(u.username, event.value.id)
    if (intro?.trim()) {
      const me: ChatPerson = { id: 'u-me', name: `${u.firstName} ${u.lastName}`, username: u.username, avatarUrl: u.avatarUrl }
      const photo = u.photos?.[0] ?? u.avatarUrl // main profile photo; text only without one
      await sendMessage(chatId, me, { text: intro.trim(), photos: photo ? [photo] : undefined })
    }
    await navigateTo({ path: '/chat', query: { chat: chatId } })
  } finally {
    joining.value = false
  }
}

// ---- "Introduce yourself" (first join of each event chat) ----
const bioOpen = ref(false)
const bioSaving = ref(false)
async function onBioSave(text: string) {
  if (!user.value) return
  bioSaving.value = true
  try {
    // Saved as the bio only when they had none (decision 27 Oct)
    if (!user.value.bio?.trim()) setUser(await saveBio(user.value, text))
    bioOpen.value = false
    await enterChat(text)
  } finally {
    bioSaving.value = false
  }
}
function onBioSkip() {
  bioOpen.value = false
  enterChat()
}
// Finish joining once they've logged in or signed up
watch(user, (u) => { if (u && joinAfterLogin) { joinAfterLogin = false; join() } })
watch([user, id], refreshStatus, { immediate: true })
watch(authOpen, (open) => { if (!open && !user.value) joinAfterLogin = false })

// ---- Share / copy ----
const { toast, share, copy } = useShareLink()
function invite() {
  if (event.value) share({ url: eventUrl(event.value.id), title: event.value.title, text: `Join me at ${event.value.title} on Vegaz` })
}
function copyAddress() {
  if (event.value) copy(event.value.address, 'Address copied')
}

// ---- Photo viewer ----
const viewerIndex = ref<number | null>(null)

// ---- Profile panel ----
const profile = ref<ChatProfile | null>(null)
const profilePanel = ref<{ focus: () => void } | null>(null)
let profileOpener: HTMLElement | null = null
async function openProfile(person: ChatPerson) {
  profileOpener = document.activeElement as HTMLElement | null
  profile.value = await getProfile(person)
  await nextTick()
  profilePanel.value?.focus()
}
function closeProfile() {
  profile.value = null
  nextTick(() => profileOpener?.isConnected && profileOpener.focus())
}
// Phones: the profile fills the screen, so the site header hides meanwhile
const hideHeaderOnPhone = useState('hide-header-phone', () => false)
watchEffect(() => { hideHeaderOnPhone.value = !!profile.value })
onBeforeUnmount(() => { hideHeaderOnPhone.value = false })

// ---- "Event Created" (host an event, Figma frame 20) ----
// The host flow opens the new event with ?created=1; closing the dialog
// (or "Go to event") leaves the page as it is, without the query.
const createdOpen = computed(() => route.query.created === '1' && !!event.value)
function closeCreated() {
  const { created: _created, ...query } = route.query
  navigateTo({ path: route.path, query }, { replace: true })
}

// ---- "Finish setting up in the Vegaz app" (hosts only, decision 27 Oct) ----
// Every time the host opens their event (after "Event Created" on the first
// visit), until "Don't show again". Closing it hides it for this visit.
const hostApp = useHostAppPrompt()
const appPromptClosed = ref(false)
watch(id, () => { appPromptClosed.value = false })
const appPromptOpen = computed(() => isHost.value && !createdOpen.value && !appPromptClosed.value && !hostApp.off.value)
function appPromptNever() {
  hostApp.turnOff()
  appPromptClosed.value = true
}
</script>

<template>
  <div v-if="event" :class="['event-page', { 'event-page--bar': count > 0 }]">
    <div class="event-page__top">
      <h1 class="event-page__title text-page-title">{{ event.title }}</h1>
      <UiButton size="small" color="secondary" class="event-page__join" :disabled="joining" @click="join">
        <template v-if="!inChat && !isHost" #icon><img src="/images/event/icon-plus-24.svg" alt="" width="16" height="16" /></template>
        {{ inChat || isHost ? 'Open Chat' : 'Join Community - Free' }}
      </UiButton>
    </div>

    <EventGallery class="event-page__gallery" :photos="event.photos" :title="event.title" :event-id="event.id" @open="viewerIndex = $event" />

    <div class="event-page__body" :style="{ '--left-rows': leftRows }">
      <div class="event-page__intro">
        <EventFacts :address="event.address" :starts-at="event.startsAt" :date-label="event.dateLabel" :price="price" @copy-address="copyAddress">
          <template #date-action>
            <ClientOnly><EventAddToCalendar :id="event.id" :event="calendarEvent!" /></ClientOnly>
          </template>
        </EventFacts>
        <EventHostTag :host="event.host" @open="openProfile(event.host)" />
      </div>

      <div class="event-page__tickets">
        <EventTicketPanel v-model:quantities="quantities" :tickets="tickets ?? []" :total="total" :count="count" :holding="holding > 0" :host="isHost" :busy="joining" @buy="buy" @share="invite" @chat="join" />
      </div>

      <section v-if="showAbout" class="event-page__about" aria-labelledby="event-about-title">
        <h2 id="event-about-title" class="event-page__section-title text-detail-section-title">About Event</h2>
        <p class="event-page__about-text text-body-regular">{{ event.about }}</p>
      </section>

      <EventExpectList v-if="showExpect" class="event-page__expect" :items="event.expectations" />

      <EventJoinCard v-if="!inChat && !isHost" class="event-page__join-card" :busy="joining" @join="join" />

      <EventCommunity v-if="showCommunity" class="event-page__community" :members="event.members" :count="event.communityCount" @invite="invite" />

      <hr class="event-page__line" />

      <EventAppBanner class="event-page__banner" />
    </div>

    <EventTicketBar v-if="count > 0 && !isHost" class="event-page__bar" :total="total" :count="count" :tiers="picked.length" :free="isFreeOnly(tickets ?? [], quantities)" @buy="buy" />

    <UiPhotoViewer
      :open="viewerIndex !== null"
      :photos="event.photos"
      :index="viewerIndex ?? 0"
      :label="`Photos of ${event.title}`"
      @update:index="viewerIndex = $event"
      @close="viewerIndex = null"
    />

    <!-- Profile: side panel on desktop, full screen on phones -->
    <Transition name="event-page-profile">
      <div v-if="profile" class="event-page__profile-backdrop" @click.self="closeProfile">
        <ChatProfilePanel ref="profilePanel" class="event-page__profile" :profile="profile" back-label="Back to event" @close="closeProfile" />
      </div>
    </Transition>

    <CheckoutFlow
      v-model:quantities="quantities"
      :open="checkoutOpen"
      :event="event"
      :tickets="tickets ?? []"
      @close="checkoutOpen = false"
      @purchased="refreshStatus"
      @join-chat="join"
    />

    <ProfileBioPrompt :open="bioOpen" :busy="bioSaving" :initial="user?.bio" @close="bioOpen = false" @save="onBioSave" @skip="onBioSkip" />

    <HostSuccessModal :open="createdOpen" :event-id="event.id" :title="event.title" @close="closeCreated" />
    <HostAppModal :open="appPromptOpen" @close="appPromptClosed = true" @never="appPromptNever" />

    <UiToast :message="toast" @done="toast = ''" />
  </div>

  <!-- Unknown event (not designed; proposed) -->
  <div v-else class="event-page event-page--missing">
    <h1 class="text-page-title">This event couldn’t be found</h1>
    <p class="text-body-regular">It may have ended or been removed.</p>
    <UiButton text-style="web" @click="navigateTo('/events')">Explore events</UiButton>
  </div>
</template>

<style scoped>
/* ---- Phones and tablets first (< 1024px): one column ---- */
.event-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl); /* phones: 32 between sections (Figma 10713:56670) */
  width: 100%;
  /* Airbnb listing: 1120 content, margins 24 / 40 / 80 */
  max-width: calc(var(--container-detail-max) + 2 * var(--container-detail-inset-desktop));
  margin-inline: auto;
  padding: var(--spacing-page-top) var(--container-detail-inset-mobile) var(--spacing-4xl);
}
/* Room for the bottom ticket bar */
.event-page--bar { padding-bottom: calc(var(--spacing-4xl) + 90px); }

.event-page__top { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-md); }
.event-page__title { margin: 0; color: var(--color-text-primary); overflow-wrap: anywhere; }
.event-page__join {
  display: none;
  flex: none;
  --ui-button-border-color: var(--color-border-default);
}
/* Airbnb small pill ("Become a host"): 40 tall, 12 sides, 16px icon */
.event-page__join :deep(.ui-button__icon) { width: var(--sizing-icon-small); height: var(--sizing-icon-small); }

.event-page__body { display: flex; flex-direction: column; gap: var(--spacing-xl); min-width: 0; } /* phones: 32 (Figma) */
.event-page__intro { display: flex; flex-direction: column; gap: var(--spacing-md); }
.event-page__about { display: flex; flex-direction: column; gap: var(--spacing-md); }
.event-page__section-title { margin: 0; color: var(--color-text-primary); }
.event-page__about-text { margin: 0; color: var(--color-text-secondary); white-space: pre-line; }
.event-page__line { width: 100%; margin: 0; border: 0; border-top: var(--border-width-default) solid var(--color-border-default); }

/* Phones: the title sits under the photos, 24px below, with the details
   (address, date, price) 24px under it (decisions 22 Oct; Figma has the
   title above the photos). */
@media (max-width: 767px) {
  .event-page__gallery { order: -1; }
  .event-page__top {
    margin-top: calc(var(--spacing-lg) - var(--spacing-xl));
    margin-bottom: calc(var(--spacing-lg) - var(--spacing-xl));
  }
}

/* Profile: full screen on phones */
.event-page__profile-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  justify-content: flex-end;
  background: var(--color-photo-scrim);
}
.event-page__profile { width: 100%; height: 100%; }
/* No open / close animation (decision 26 Oct) */

.event-page--missing { align-items: flex-start; gap: var(--spacing-md); min-height: 50vh; }
.event-page--missing h1,
.event-page--missing p { margin: 0; }
.event-page--missing p { color: var(--color-text-secondary); }

@media (min-width: 768px) {
  .event-page { gap: var(--spacing-2xl); padding-inline: var(--container-detail-inset-tablet); }
  /* Airbnb listing sections: 48 above and below each dividing line */
  .event-page__body { gap: var(--spacing-section-block); }
  /* Proposed: desktop/tablet profile = side panel over the page */
  .event-page__profile {
    width: 375px;
    max-width: 100%;
    padding: var(--spacing-lg);
    background: var(--color-background-primary);
    box-shadow: var(--shadow-dp3);
  }
}

/* ---- Desktop (>= 1024px): Figma Desktop 64 ---- */
@media (min-width: 1024px) {
  .event-page {
    padding: var(--spacing-page-top) var(--container-detail-inset-desktop) 52px;
    max-width: calc(var(--container-detail-max) + 2 * var(--container-detail-inset-desktop));
  }
  .event-page--bar { padding-bottom: 52px; }
  .event-page__join { display: inline-flex; }
  .event-page__body {
    display: grid;
    /* Airbnb listing columns: 7/12 content, 1/12 gap, 4/12 booking card
       (653 / 93 / 373 at 1120) */
    grid-template-columns: minmax(0, 7fr) minmax(360px, 4fr);
    column-gap: 8.333%;
    row-gap: var(--spacing-section-block);
    align-items: start;
  }
  .event-page__body > * { grid-column: 1; }
  .event-page__tickets {
    grid-column: 2;
    grid-row: 1 / span var(--left-rows, 5); /* the visible left-column sections (some hide when empty) */
    position: sticky;
    top: calc(var(--sizing-header-height) + var(--spacing-lg)); /* below the sticky header */
  }
  .event-page__join-card,
  .event-page__line,
  .event-page__bar { display: none; }
}
</style>
