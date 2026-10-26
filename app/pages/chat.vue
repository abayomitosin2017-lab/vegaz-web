<script setup lang="ts">
/**
 * Chat page (Figma section "chat", 10681:52423): event chats for the
 * signed-in user. Opened from the profile menu ("Chat").
 *
 * Layout (Figma Desktop 54-57, 1440 wide): 40px below the header, 64px sides,
 * 43px bottom; the page fills the screen height and each column scrolls on its
 * own (no footer).
 *   list 342px | 40px | conversation (rest)
 *   with a profile open: list 342 | 24 | conversation | 24 | profile 327.6
 * Below 1024px (no design; desktop squeezed): the list narrows; with a profile
 * open the list is hidden until the profile closes.
 * Phones (< 768px, Figma mobile chat frames, 21 Oct): one screen at a time.
 *   no chat open -> chat list under the normal site header
 *   chat open    -> conversation, full screen, with its back-arrow top bar
 *                   (the site header hides)
 *   profile open -> profile, full screen; its back arrow returns to the chat
 * The "no chats yet" message shows under the list; "Select a chat" is
 * desktop only.
 *
 * Signed out: goes back to the home page and opens Login or signup.
 * The open chat is kept in the address (?chat=house-party).
 */
import type { ChatMessage, ChatPerson, ChatProfile, ChatSummary, NewMessage } from '~/types/chat'
import type { EventDetails } from '~/types/event'
import type { TicketType } from '~/types/ticket'
import { getMessages, getProfile, listChats, markRead, sendMessage } from '~/services/chat'
import { getEvent } from '~/services/events'
import { getTicketTypes } from '~/services/tickets'
import { isFreeOnly } from '~/utils/ticketCta'

definePageMeta({ footer: false, requiresAuth: true })
useHead({ title: 'Chats · Vegaz' })

const { user } = useSession()
const { open: openAuth } = useAuthModal()
const route = useRoute()
const router = useRouter()

const chats = ref<ChatSummary[]>([])
const loadingChats = ref(true)
const messages = ref<ChatMessage[]>([])
const sending = ref(false)
const profile = ref<ChatProfile | null>(null)
const profilePanel = ref<{ focus: () => void } | null>(null)

// Phones: hide the site header while a conversation or profile fills the screen
const hideHeaderOnPhone = useState('hide-header-phone', () => false)
let profileOpener: HTMLElement | null = null

const me = computed<ChatPerson | null>(() =>
  user.value
    ? { id: 'u-me', name: `${user.value.firstName} ${user.value.lastName}`, username: user.value.username, avatarUrl: user.value.avatarUrl }
    : null,
)
const selectedId = computed(() => (typeof route.query.chat === 'string' ? route.query.chat : null))
const selected = computed(() => chats.value.find(c => c.id === selectedId.value) ?? null)

async function loadChats() {
  if (!user.value) return
  loadingChats.value = true
  chats.value = await listChats(user.value.username, user.value.email)
  loadingChats.value = false
}

watch(
  user,
  (u, before) => {
    if (!import.meta.client) return
    if (!u) {
      // Arrived signed out: go home and ask to log in. (After logging out
      // here, the layout already takes you home; no login prompt then.)
      if (!before) {
        navigateTo('/')
        openAuth()
      }
      return
    }
    loadChats()
  },
  { immediate: true },
)

watch(
  selectedId,
  async (id) => {
    profile.value = null
    messages.value = []
    if (!id) return
    messages.value = await getMessages(id)
    await markRead(id)
    const chat = chats.value.find(c => c.id === id)
    if (chat) chat.unreadCount = 0
  },
  { immediate: true },
)

function select(id: string) {
  router.replace({ query: { ...route.query, chat: id } })
}
function backToList() {
  const { chat: _open, ...rest } = route.query
  router.replace({ query: rest })
}
watchEffect(() => { hideHeaderOnPhone.value = !!selected.value })
onBeforeUnmount(() => { hideHeaderOnPhone.value = false })

async function onSend(draft: NewMessage) {
  if (!selected.value || !me.value) return
  sending.value = true
  try {
    const message = await sendMessage(selected.value.id, me.value, toRaw(draft))
    messages.value.push(message)
    chats.value = await listChats(user.value!.username, user.value!.email)
  } finally {
    sending.value = false // OPEN ITEM: failed-send state is not designed
  }
}

async function openProfile(person: ChatPerson) {
  profileOpener = document.activeElement as HTMLElement | null
  profile.value = await getProfile(person)
  await nextTick()
  profilePanel.value?.focus()
}
// "Buy Ticket" in a chat header (no ticket yet): the buy flow opens on top
// of the chat at Add Ticket with an empty cart (decision 22 Oct). Once bought,
// the chat list reloads, so the header shows "Share Event".
// RSVP instead of Buy Ticket when the chat's event only has free tickets (decision 26 Oct)
const chatFree = ref(false)
watch(() => selected.value?.eventId, async (id) => {
  chatFree.value = false
  if (!id) return
  const list = await getTicketTypes(id)
  if (selected.value?.eventId === id) chatFree.value = isFreeOnly(list)
}, { immediate: true })
const checkout = reactive({ open: false, event: null as EventDetails | null, tickets: [] as TicketType[], quantities: {} as Record<string, number> })
async function buyTicket() {
  const eventId = selected.value?.eventId
  if (!eventId) return
  const [event, tickets] = await Promise.all([getEvent(eventId), getTicketTypes(eventId)])
  if (!event) return
  Object.assign(checkout, { event, tickets, quantities: Object.fromEntries(tickets.map(t => [t.id, 0])), open: true })
}

function closeProfile() {
  profile.value = null
  nextTick(() => profileOpener?.isConnected && profileOpener.focus())
}
</script>

<template>
  <div v-if="user" :class="['chat-page', { 'chat-page--open': selected, 'chat-page--profile': profile }]">
    <ChatList class="chat-page__list" :chats="chats" :selected-id="selectedId" :loading="loadingChats" @select="select" />

    <ChatConversation
      v-if="selected"
      :chat="selected"
      :messages="messages"
      :sending="sending"
      @send="onSend"
      @profile="openProfile"
      @back="backToList"
      :free="chatFree"
      @buy-ticket="buyTicket"
    />
    <ChatEmpty
      v-else-if="!loadingChats"
      :class="['chat-page__empty', `chat-page__empty--${chats.length ? 'select' : 'none'}`]"
      :variant="chats.length ? 'select' : 'none'"
    />

    <ChatProfilePanel v-if="profile" ref="profilePanel" class="motion-panel-in" :profile="profile" @close="closeProfile" />

    <CheckoutFlow
      v-if="checkout.event"
      v-model:quantities="checkout.quantities"
      :open="checkout.open"
      :event="checkout.event"
      :tickets="checkout.tickets"
      start="add"
      @close="checkout.open = false"
      @purchased="loadChats"
    />
  </div>
</template>

<style scoped>
.chat-page {
  --chat-page-height: calc(100dvh - var(--sizing-header-height)); /* screen minus the header */
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(240px, 342px) minmax(0, 1fr);
  gap: var(--spacing-lg);
  width: 100%;
  min-width: 768px;
  max-width: calc(var(--container-web-desktop-max) + 2 * var(--container-inset-desktop));
  height: var(--chat-page-height);
  min-height: 480px;
  margin-inline: auto;
  padding: var(--spacing-page-top) var(--container-inset-tablet) 43px; /* Figma: 43px bottom */
}
.chat-page > * { min-height: 0; }
.chat-page--profile { grid-template-columns: minmax(0, 1fr) 327.6px; }
.chat-page--profile .chat-page__list { display: none; }

@media (min-width: 1024px) {
  .chat-page { padding-inline: var(--container-inset-desktop); }
  .chat-page:not(.chat-page--profile) { gap: var(--spacing-2xl); }
  .chat-page--profile { grid-template-columns: minmax(240px, 342px) minmax(0, 1fr) 327.6px; }
  .chat-page--profile .chat-page__list { display: flex; }
}

/* ---- Phones (< 768px): one screen at a time ---- */
@media (max-width: 767px) {
  .chat-page {
    display: block;
    min-width: 0;
    height: auto;
    min-height: 0;
    padding: 0 0 var(--spacing-lg);
  }
  .chat-page--open {
    display: flex;
    flex-direction: column;
    height: 100dvh; /* site header is hidden on this screen */
    padding: 0;
  }
  .chat-page--open .chat-page__list,
  .chat-page--profile > .chat-conv { display: none; }
  .chat-page--open > * { flex: 1; }
  .chat-page__empty--select { display: none; }
  .chat-page__empty--none { margin: var(--spacing-lg) var(--spacing-md) 0; }
}
</style>
