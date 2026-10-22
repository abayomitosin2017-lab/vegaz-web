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
 *   chat opens (the button text doesn't change).
 * - Buy Ticket: opens the buy ticket flow (CheckoutFlow; decisions 22 Oct).
 * - Photo -> full-size viewer. Host / community person -> profile panel
 *   (desktop: side panel; phones: full screen). Invite Friend -> share.
 * - Copy icon -> copies the address, "Address copied".
 * Copy: "About Hangout" -> "About Event" (Hangouts -> Events rule).
 */
import type { ChatPerson, ChatProfile } from '~/types/chat'
import { getEvent } from '~/services/events'
import { getTicketTypes } from '~/services/tickets'
import { getProfile, isInEventChat, joinEventChat } from '~/services/chat'
import { ticketsHeld } from '~/services/tickets'
import { priceRange } from '~/utils/money'

const route = useRoute()
const id = computed(() => String(route.params.id))

const { data: event } = await useAsyncData(`event-${id.value}`, () => getEvent(id.value), { watch: [id] })
const { data: tickets } = await useAsyncData(`tickets-${id.value}`, () => getTicketTypes(id.value), { watch: [id], default: () => [] })

useHead(() => ({ title: event.value ? `${event.value.title} · Vegaz` : 'Event not found · Vegaz' }))

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
const inChat = ref(false)
async function refreshStatus() {
  holding.value = ticketsHeld(user.value?.email, id.value)
  inChat.value = user.value ? await isInEventChat(user.value.username, id.value) : false
}
function buy() {
  if (count.value > 0) checkoutOpen.value = true
}

// ---- Join the community -> open its chat ----
const { user } = useSession()
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
  joining.value = true
  try {
    const chatId = await joinEventChat(user.value.username, event.value.id)
    await navigateTo({ path: '/chat', query: { chat: chatId } })
  } finally {
    joining.value = false
  }
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
</script>

<template>
  <div v-if="event" :class="['event-page', { 'event-page--bar': count > 0 }]">
    <div class="event-page__top">
      <h1 class="event-page__title text-page-title">{{ event.title }}</h1>
      <UiButton color="secondary" text-style="web" class="event-page__join" :disabled="joining" @click="join">
        <template v-if="!inChat" #icon><img src="/images/event/icon-plus-24.svg" alt="" width="24" height="24" /></template>
        {{ inChat ? 'Open Chat' : 'Join Community - Free' }}
      </UiButton>
    </div>

    <EventGallery class="event-page__gallery" :photos="event.photos" :title="event.title" @open="viewerIndex = $event" />

    <div class="event-page__body">
      <div class="event-page__intro">
        <EventFacts :address="event.address" :starts-at="event.startsAt" :date-label="event.dateLabel" :price="price" @copy-address="copyAddress" />
        <EventHostTag :host="event.host" @open="openProfile(event.host)" />
      </div>

      <div class="event-page__tickets">
        <EventTicketPanel v-model:quantities="quantities" :tickets="tickets ?? []" :total="total" :count="count" :holding="holding > 0" @buy="buy" @share="invite" />
      </div>

      <section class="event-page__about" aria-labelledby="event-about-title">
        <h2 id="event-about-title" class="event-page__section-title text-section-title">About Event</h2>
        <p class="event-page__about-text text-body-regular">{{ event.about }}</p>
      </section>

      <EventExpectList class="event-page__expect" :items="event.expectations" />

      <EventJoinCard v-if="!inChat" class="event-page__join-card" :busy="joining" @join="join" />

      <EventCommunity class="event-page__community" :members="event.members" :count="event.communityCount" @profile="openProfile" @invite="invite" />

      <hr class="event-page__line" />

      <EventAppBanner class="event-page__banner" />
    </div>

    <EventTicketBar v-if="count > 0" class="event-page__bar" :total="total" :count="count" :tiers="picked.length" @buy="buy" />

    <UiPhotoViewer
      :open="viewerIndex !== null"
      :photos="event.photos"
      :index="viewerIndex ?? 0"
      :label="`Photos of ${event.title}`"
      @update:index="viewerIndex = $event"
      @close="viewerIndex = null"
    />

    <!-- Profile: side panel on desktop, full screen on phones -->
    <div v-if="profile" class="event-page__profile-backdrop" @click.self="closeProfile">
      <ChatProfilePanel ref="profilePanel" class="event-page__profile" :profile="profile" back-label="Back to event" @close="closeProfile" />
    </div>

    <CheckoutFlow
      v-model:quantities="quantities"
      :open="checkoutOpen"
      :event="event"
      :tickets="tickets ?? []"
      @close="checkoutOpen = false"
      @purchased="refreshStatus"
      @join-chat="join"
    />

    <UiToast :message="toast" @done="toast = ''" />
  </div>

  <!-- Unknown event (not designed; proposed) -->
  <div v-else class="event-page event-page--missing">
    <h1 class="text-section-title">This event couldn’t be found</h1>
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
  gap: var(--spacing-2xl);
  width: 100%;
  max-width: calc(1140px + 2 * var(--container-inset-desktop));
  margin-inline: auto;
  padding: var(--spacing-3xl) var(--container-inset-mobile) var(--spacing-4xl);
}
/* Room for the bottom ticket bar */
.event-page--bar { padding-bottom: calc(var(--spacing-4xl) + 90px); }

.event-page__top { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-md); }
.event-page__title { margin: 0; color: var(--color-text-primary); overflow-wrap: anywhere; }
.event-page__join {
  display: none;
  flex: none;
  --ui-button-pad-x: var(--spacing-xl);
  --ui-button-pad-y: var(--spacing-sm);
  --ui-button-border-color: var(--color-border-default);
}

.event-page__body { display: flex; flex-direction: column; gap: var(--spacing-2xl); min-width: 0; }
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
    margin-top: calc(var(--spacing-lg) - var(--spacing-2xl));
    margin-bottom: calc(var(--spacing-lg) - var(--spacing-2xl));
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

.event-page--missing { align-items: flex-start; gap: var(--spacing-md); min-height: 50vh; }
.event-page--missing h1,
.event-page--missing p { margin: 0; }
.event-page--missing p { color: var(--color-text-secondary); }

@media (min-width: 768px) {
  .event-page { padding-inline: var(--container-inset-tablet); }
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
    padding: 62px var(--container-inset-desktop) 52px; /* Figma: 62px under the header, 52px above the footer */
    max-width: calc(1140px + 2 * var(--container-inset-desktop));
  }
  .event-page--bar { padding-bottom: 52px; }
  .event-page__join { display: inline-flex; }
  .event-page__body {
    display: grid;
    grid-template-columns: minmax(0, 601px) minmax(360px, 431px);
    justify-content: space-between;
    column-gap: var(--spacing-lg);
    row-gap: var(--spacing-3xl);
    align-items: start;
  }
  .event-page__body > * { grid-column: 1; }
  .event-page__tickets {
    grid-column: 2;
    grid-row: 1 / span 5; /* the 5 visible left-column sections */
    position: sticky;
    top: calc(88px + var(--spacing-lg)); /* below the 88px sticky header */
  }
  .event-page__join-card,
  .event-page__line,
  .event-page__bar { display: none; }
}
</style>
