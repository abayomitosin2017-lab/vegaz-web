<script setup lang="ts">
/**
 * Event details (Figma section "event details", 10715:65072; gallery update
 * 10724:67468).
 *
 * Desktop (>= 1024px, Desktop 64/65/66): 1140px column, 62px under the header.
 *   Title row: title (40/48 bold) + "Share Event" and "Join Community -
 *   Free" (small secondary pills, Grey_5 line, text only; decision 27 Oct). 40px below: gallery. 40px below: two
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
 * - Photo -> full-size viewer. "Hosted by" tag -> profile panel. Community
 *   "View all" / "+N Others" -> everyone in a modal; tapping a person opens
 *   their profile (decision 27 Oct)
 *   (desktop: side panel; phones: full screen).
 * - Copy icon -> copies the address, "Address copied".
 * - Empty sections are hidden (decision 27 Oct): About Event with no
 *   description, What to expect with no items, Community under COMMUNITY_MIN
 *   (10) people. The "Not ready to buy a ticket?" block stays.
 * - Host of this event: "Unlock your host tools in the app" modal on each
 *   visit (HostAppModal, decision 27 Oct).
 * - While the event loads: placeholders in the page layout (title, photos,
 *   details, tickets, About; decision 27 Oct).
 * Copy: "About Hangout" -> "About Event" (Hangouts -> Events rule).
 */
import type { ChatPerson, ChatProfile } from '~/types/chat'
import { getEvent } from '~/services/events'
import { getTicketTypes, watchTicketStock } from '~/services/tickets'
import { getProfile, isInEventChat, joinEventChat, sendMessage } from '~/services/chat'
import { saveBio } from '~/services/profile'
import { ticketsHeld } from '~/services/tickets'
import { priceRange } from '~/utils/money'
import { COMMUNITY_MIN } from '~/config/event'

const route = useRoute()
const id = computed(() => String(route.params.id))

// Lazy: the page shows at once with placeholders until the event arrives (decision 27 Oct)
const { data: event, status: eventStatus, refresh: refreshEvent } = useLazyAsyncData(`event-${id.value}`, () => getEvent(id.value), { watch: [id] })
const { data: tickets, refresh: refreshTickets } = useLazyAsyncData(`tickets-${id.value}`, () => getTicketTypes(id.value), { watch: [id], default: () => [] })
// Couldn't load (network / server), not the same as "not found" (decision 27 Oct)
const eventFailed = computed(() => !event.value && eventStatus.value === 'error')
const eventLoading = computed(() => !event.value && (eventStatus.value === 'pending' || eventStatus.value === 'idle'))

useHead(() => ({ title: event.value ? `${event.value.title} · Vegaz` : eventLoading.value || eventFailed.value ? 'Vegaz' : 'Event not found · Vegaz' }))

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
// A new event starts with nothing picked. When what's left changes (someone
// else bought, decision 27 Oct), picks are kept but never more than what's
// left; a short message says when a pick was cut or sold out.
watch(id, () => { quantities.value = {} })
watch(tickets, (list) => {
  const prev = quantities.value
  const next: Record<string, number> = {}
  const notes: string[] = []
  for (const t of list ?? []) {
    const had = prev[t.id] ?? 0
    const max = t.availability === 'sold-out' ? 0 : (t.maxQuantity ?? Number.POSITIVE_INFINITY)
    next[t.id] = Math.min(had, max)
    if (had > next[t.id]!) notes.push(next[t.id] ? `Only ${next[t.id]} ${t.name} left, so we changed your pick` : `${t.name} just sold out, so we removed it`)
  }
  quantities.value = next
  if (notes.length) showToast(notes.join('. '))
}, { immediate: true })
// Live "N tickets left" (mock demo; engineering: push or polling)
let stopStock: (() => void) | undefined
function watchStock() {
  stopStock?.()
  stopStock = watchTicketStock(id.value, (list) => { tickets.value = list })
}
onMounted(watchStock)
watch(id, watchStock)
onBeforeUnmount(() => stopStock?.())
function onPurchased() {
  refreshStatus()
  refreshTickets() // fewer left now
}
const picked = computed(() => (tickets.value ?? []).filter(t => (quantities.value[t.id] ?? 0) > 0))
const count = computed(() => picked.value.reduce((n, t) => n + (quantities.value[t.id] ?? 0), 0))
const total = computed(() => picked.value.reduce((sum, t) => sum + t.price * (quantities.value[t.id] ?? 0), 0))
const price = computed(() => priceRange((tickets.value ?? []).map(t => t.price)))
// Buy Ticket opens the checkout (Figma 10713:56670, decisions 22 Oct)
const checkoutOpen = ref(false)
const phone = usePhoneLayout()
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
// Phone ticket bar: tapping it (not the button) scrolls to the tickets
function showTickets() {
  const el = document.querySelector<HTMLElement>('.event-page__tickets')
  if (!el) return
  const header = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - header - 16, behavior: 'smooth' })
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
function showToast(text: string) { toast.value = text }
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
// Phones: the event header (EventStickyHeader, with a back arrow) replaces the
// Vegaz header on event pages (decision 27 Oct)
watchEffect(() => { hideHeaderOnPhone.value = !!event.value })
onBeforeUnmount(() => { hideHeaderOnPhone.value = false })

// ---- "Event Created" (host an event, Figma frame 20) ----
// The host flow opens the new event with ?created=1; closing the dialog
// (or "Go to event") leaves the page as it is, without the query.
const createdOpen = computed(() => route.query.created === '1' && !!event.value)
function closeCreated() {
  const { created: _created, ...query } = route.query
  navigateTo({ path: route.path, query }, { replace: true })
}

// ---- Community "View all" (decision 27 Oct) ----
const communityOpen = ref(false)
function openMember(person: ChatPerson) {
  communityOpen.value = false
  nextTick(() => openProfile(person))
}

// ---- Sticky header with the name + buttons, every width (decision 27 Oct; desktop added 27 Oct) ----
// Shows once the title row has scrolled up behind the site header
const topRow = ref<HTMLElement | null>(null)
const stickyOn = ref(false)
let topObserver: IntersectionObserver | null = null
function watchTop() {
  topObserver?.disconnect()
  if (!topRow.value) return
  const header = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0
  topObserver = new IntersectionObserver(([e]) => { stickyOn.value = !!e && !e.isIntersecting && e.boundingClientRect.top < header }, { rootMargin: `-${header}px 0px 0px 0px` })
  topObserver.observe(topRow.value)
}
onMounted(() => nextTick(watchTop))
watch([id, () => !!event.value], () => nextTick(watchTop))
onBeforeUnmount(() => topObserver?.disconnect())

// ---- "Unlock your host tools in the app" (hosts only, decision 27 Oct) ----
// Every time the host opens their event (after "Event Created" on the first
// visit). "Maybe Later" / closing hides it until their next visit.
const appPromptClosed = ref(false)
watch(id, () => { appPromptClosed.value = false })
const appPromptOpen = computed(() => isHost.value && !createdOpen.value && !appPromptClosed.value)
</script>

<template>
  <div v-if="event" :class="['event-page', 'event-page--ready', { 'event-page--bar': count > 0 }]">
    <ClientOnly>
      <EventStickyHeader :show="stickyOn" :hidden="!!profile" :title="event.title" :action-label="inChat || isHost ? 'Open Chat' : 'Join Community - Free'" :busy="joining" @share="invite" @action="join" />
    </ClientOnly>
    <div ref="topRow" class="event-page__top">
      <h1 class="event-page__title text-page-title">{{ event.title }}</h1>
      <!-- Text only, with Share Event beside it (decision 27 Oct) -->
      <div class="event-page__actions">
        <UiButton size="small" :color="'positive'" class="event-page__join" :disabled="joining" @click="join">
          {{ inChat || isHost ? 'Open Chat' : 'Join Community - Free' }}
        </UiButton>
        <UiButton size="small" color="secondary" class="event-page__share" @click="invite">Share Event</UiButton><!-- far right (decision 27 Oct) -->
      </div>
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
        <!-- Desktop: a cue that joining is free (decision 27 Oct; hidden for the host and members) -->
        <p v-if="!inChat && !isHost" class="event-page__join-note text-small-regular">
          You can <button type="button" class="event-page__join-link text-small-semibold" :disabled="joining" @click="join">join community</button> without buying ticket
        </p>
      </div>

      <section v-if="showAbout" class="event-page__about" aria-labelledby="event-about-title">
        <h2 id="event-about-title" class="event-page__section-title text-detail-section-title">About Event</h2>
        <p class="event-page__about-text text-body-regular">{{ event.about }}</p>
      </section>

      <EventExpectList v-if="showExpect" class="event-page__expect" :items="event.expectations" />

      <EventJoinCard v-if="!inChat && !isHost" class="event-page__join-card" :busy="joining" @join="join" />

      <EventCommunity v-if="showCommunity" class="event-page__community" :members="event.members" :count="event.communityCount" @view="communityOpen = true" />

      <hr class="event-page__line" />

      <EventAppBanner class="event-page__banner" />
    </div>

    <!-- Phones: Buy Ticket bar that grows into the ticket sheet (decision 28 Oct) -->
    <ClientOnly>
      <EventMobileBuy
        v-if="phone && !isHost && (tickets ?? []).length && !profile"
        v-model:quantities="quantities"
        :tickets="tickets ?? []"
        :total="total"
        :count="count"
        :tiers="picked.length"
        :free="isFreeOnly(tickets ?? [], quantities)"
        @proceed="buy"
      />
    </ClientOnly>
    <!-- Tablets: the bar once a ticket is picked -->
    <EventTicketBar v-if="!phone && count > 0 && !isHost" class="event-page__bar" :total="total" :count="count" :tiers="picked.length" :free="isFreeOnly(tickets ?? [], quantities)" @buy="buy" @show="showTickets" />

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
      :skip-cart="phone"
      @close="checkoutOpen = false"
      @purchased="onPurchased"
      @join-chat="join"
    />

    <ProfileBioPrompt :open="bioOpen" :busy="bioSaving" :initial="user?.bio" @close="bioOpen = false" @save="onBioSave" @skip="onBioSkip" />

    <HostSuccessModal :open="createdOpen" :event-id="event.id" :title="event.title" @close="closeCreated" />
    <EventCommunityModal :open="communityOpen" :event-id="event.id" :count="event.communityCount" @close="communityOpen = false" @open="openMember" />
    <HostAppModal :open="appPromptOpen" @close="appPromptClosed = true" />

    <UiToast :message="toast" @done="toast = ''" />
  </div>

  <!-- Loading (decision 27 Oct): placeholders in the page's own layout -->
  <div v-else-if="eventLoading" class="event-page event-page--loading" aria-busy="true" aria-label="Loading event">
    <div class="event-page__top"><UiSkeleton class="event-page__sk-title" height="40px" radius="var(--radius-md)" /></div>
    <UiSkeleton class="event-page__gallery event-page__sk-gallery" height="auto" radius="var(--radius-lg)" />
    <div class="event-page__body" style="--left-rows: 3">
      <div class="event-page__intro">
        <div v-for="n in 3" :key="n" class="event-page__sk-row">
          <UiSkeleton width="24px" height="24px" radius="var(--radius-full)" />
          <UiSkeleton :width="n === 1 ? '70%' : n === 2 ? '45%' : '35%'" height="20px" />
        </div>
        <UiSkeleton width="100%" height="64px" radius="var(--radius-pill)" />
      </div>
      <div class="event-page__tickets">
        <UiSkeleton v-for="n in 2" :key="n" height="148px" radius="var(--radius-xl)" class="event-page__sk-ticket" />
      </div>
      <div class="event-page__about">
        <UiSkeleton width="40%" height="26px" />
        <UiSkeleton height="16px" /><UiSkeleton height="16px" /><UiSkeleton width="60%" height="16px" />
      </div>
    </div>
  </div>

  <!-- Unknown event (not designed; proposed) -->
  <div v-else-if="eventFailed" class="event-page event-page--failed">
    <UiErrorState what="this event" :level="1" @retry="refreshEvent(); refreshTickets()" />
  </div>
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
/* room for the ticket bar is added under the whole page by EventTicketBar (decision 27 Oct) */

.event-page__top { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-md); }
.event-page__actions { flex: none; display: none; gap: var(--spacing-xs); }
.event-page__title { margin: 0; color: var(--color-text-primary); overflow-wrap: anywhere; }
.event-page__join,
.event-page__share { flex: none; --ui-button-border-color: var(--color-border-default); } /* Airbnb small pill, 40 tall, text only */

.event-page__body { display: flex; flex-direction: column; gap: var(--spacing-xl); min-width: 0; } /* phones: 32 (Figma) */
.event-page__intro { display: flex; flex-direction: column; gap: var(--spacing-md); }
.event-page__join-note { display: none; }
.event-page__about { display: flex; flex-direction: column; gap: var(--spacing-md); }
.event-page__section-title { margin: 0; color: var(--color-text-primary); }
.event-page__about-text { margin: 0; color: var(--color-text-secondary); white-space: pre-line; }
.event-page__line { width: 100%; margin: 0; border: 0; border-top: var(--border-width-default) solid var(--color-border-default); }

/* Phones: the title sits under the photos, 24px below, with the details
   (address, date, price) 24px under it (decisions 22 Oct; Figma has the
   title above the photos). */
/* Phones: room for the fixed event header (the Vegaz header is hidden here, decision 27 Oct) */
@media (max-width: 767px) {
  .event-page--ready { padding-top: calc(var(--sizing-header-height) + var(--spacing-page-top)); }
}
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

.event-page__sk-title { width: min(420px, 70%); }
.event-page__sk-gallery { width: 100%; height: 240px; }
.event-page__sk-row { display: flex; align-items: center; gap: var(--spacing-md); min-height: 28px; }
.event-page__sk-ticket + .event-page__sk-ticket { margin-top: var(--spacing-md); }
@media (min-width: 768px) { .event-page__sk-gallery { height: 354px; } }
.event-page--failed { justify-content: center; min-height: 50vh; }
.event-page--missing { align-items: flex-start; gap: var(--spacing-md); min-height: 50vh; }
.event-page--missing h1,
.event-page--missing p { margin: 0; }
.event-page--missing p { color: var(--color-text-secondary); }

@media (min-width: 768px) {
  .event-page { gap: var(--spacing-2xl); padding-inline: var(--container-detail-inset-tablet); }
  /* Title row to photos: 24, the same as header to title row, so the title
     sits evenly between them (decision 27 Oct; was 40) */
  .event-page__gallery { margin-top: calc(var(--spacing-lg) - var(--spacing-2xl)); }
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
  .event-page__actions { display: flex; }
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
  .event-page__join-note { display: block; margin: var(--spacing-md) 0 0; color: var(--color-text-secondary); text-align: center; }
  .event-page__join-link { display: inline; padding: 0; border: 0; background: none; color: var(--color-action-primary); cursor: pointer; }
  .event-page__join-link:hover { text-decoration: underline; }
  .event-page__join-link:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; border-radius: var(--radius-xs); }
  .event-page__join-card,
  .event-page__line,
  .event-page__bar { display: none; }
}
</style>
