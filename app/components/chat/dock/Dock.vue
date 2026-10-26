<script setup lang="ts">
import './styles.css'
import { onIncomingMessage } from '~/services/chat'
/**
 * Chat dock: quick replies without leaving the page (decision 26 Oct; Figma
 * section "Chat dock — web", 10862:22113).
 * Signed-in only, screens 768px and wider; docked bottom right (24 from the
 * right edge, on the bottom). Not on the Chat page (the layout leaves it out).
 * - Minimized: the bar ("Messages" + red unread count).
 * - Expanded: the chat list (360 × 560, search, event chats newest first).
 * - One conversation at a time (360 × 520), 16 left of the bar / list;
 *   opening another chat replaces it. Minimized it becomes a 240 tab.
 * - 768-1023: one panel; opening a chat replaces the list, ← goes back.
 * - New message while the chat isn't open: unread count + a 5 s preview
 *   above the bar (Reply opens that chat).
 * - Escape minimizes the open window; open / minimized and the open chat are
 *   kept for this browser tab.
 * No open / close animation (decision 26 Oct).
 */
const dock = useChatDock()
const { state, chats, loaded, toast, unread, openChat, bottomOffset } = dock
const { user } = useSession()
const tablet = useMediaQuery('(max-width: 1023px)')
const query = ref('')
const listId = useId()
const conv = ref<{ focus: () => void; receive: (m: any) => void } | null>(null)
const tabEl = ref<HTMLElement | null>(null)
const barWrap = ref<HTMLElement | null>(null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? chats.value.filter(c => c.title.toLowerCase().includes(q)) : chats.value
})
// Tablet: a chat open (not minimized) takes the list's place
const showConv = computed(() => !!openChat.value && !state.value.chatMinimized)
const singlePanel = computed(() => tablet.value && showConv.value)
const showTab = computed(() => !!openChat.value && state.value.chatMinimized)

function full(chatId?: string | null) {
  const id = chatId ?? state.value.chatId
  state.value.listOpen = false
  navigateTo(id ? { path: '/chat', query: { chat: id } } : '/chat')
}
async function select(id: string) {
  await dock.open(id)
  if (tablet.value) state.value.listOpen = true
  nextTick(() => conv.value?.focus())
}
async function reply(id: string) {
  await select(id)
}
function restore() { dock.restoreChat(); nextTick(() => conv.value?.focus()) }
function back() { dock.closeChat(); state.value.listOpen = true }
function closeConv() { dock.closeChat(); nextTick(() => barWrap.value?.querySelector<HTMLElement>('button')?.focus()) }
function minimizeConv() { dock.minimizeChat(); nextTick(() => tabEl.value?.querySelector<HTMLElement>('button')?.focus()) }
function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if (showConv.value) { e.stopPropagation(); minimizeConv() }
  else if (state.value.listOpen) { e.stopPropagation(); dock.minimizeList(); nextTick(() => barWrap.value?.querySelector<HTMLElement>('button')?.focus()) }
}

// Remember open / minimized and the open chat for this tab
const KEY = 'vegaz-chat-dock'
let stopIncoming = () => {}
onMounted(async () => {
  try { const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (saved) Object.assign(state.value, saved) } catch { /* storage unavailable */ }
  await dock.refresh()
  if (state.value.chatId && !chats.value.some(c => c.id === state.value.chatId)) dock.closeChat()
  if (user.value) {
    stopIncoming = onIncomingMessage(user.value.username, (message, chat) => {
      const i = chats.value.findIndex(c => c.id === chat.id)
      if (i >= 0) chats.value.splice(i, 1, chat); else chats.value.unshift(chat)
      chats.value.sort((a, b) => b.lastAt.localeCompare(a.lastAt))
      if (showConv.value && state.value.chatId === chat.id) { conv.value?.receive(message); dock.read(chat.id); return }
      toast.value = { chatId: chat.id, senderName: message.sender.name, senderAvatar: message.sender.avatarUrl, senderSeed: message.sender.username, eventTitle: chat.title, text: message.text ?? 'Sent a photo' }
    })
  }
})
watch(state, (s) => { try { sessionStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ } }, { deep: true })
onBeforeUnmount(() => stopIncoming())
// Keep the list fresh after sending (last message / order)
async function onSent() { await dock.refresh() }
</script>

<template>
  <div class="dock" :style="{ '--dock-bottom': `${bottomOffset}px` }" @keydown="onKey">
    <!-- Conversation (desktop: beside the list / bar; tablet: in its place) -->
    <ChatDockConversation
      v-if="showConv && openChat && !singlePanel"
      ref="conv"
      :chat="openChat"
      @minimize="minimizeConv"
      @close="closeConv"
      @full="full()"
      @sent="onSent"
    />
    <div v-else-if="showTab && openChat" ref="tabEl" class="dock-tab">
      <button type="button" class="dock-tab__main dock-focus" :aria-label="`Open chat ${openChat.title}${openChat.unreadCount ? `, ${openChat.unreadCount} unread` : ''}`" @click="restore">
        <span class="dock-tab__pic"><img v-if="openChat.imageUrl" :src="openChat.imageUrl" alt="" width="32" height="32" /></span>
        <span class="dock-title dock-title--14 dock-ellipsis">{{ openChat.title }}</span>
        <span v-if="openChat.unreadCount" class="dock-count" aria-hidden="true">{{ openChat.unreadCount }}</span>
      </button>
      <button type="button" class="dock-icon-btn" aria-label="Open chat" @click="restore"><img src="/images/dock/icon-chevron-up-24.svg" alt="" width="20" height="20" /></button>
      <button type="button" class="dock-icon-btn" aria-label="Close chat" @click="dock.closeChat()"><img class="dock-icon-16" src="/images/host/icon-close-16.svg" alt="" width="16" height="16" /></button>
    </div>

    <div ref="barWrap" class="dock__col">
      <ChatDockToast v-if="toast && !state.listOpen && !(showConv && state.chatId === toast.chatId)" :toast="toast" @reply="reply" @dismiss="toast = null" />

      <!-- Tablet with a chat open: the conversation replaces the list -->
      <ChatDockConversation
        v-if="singlePanel && openChat"
        ref="conv"
        :chat="openChat"
        back
        @back="back"
        @minimize="minimizeConv"
        @close="closeConv"
        @full="full()"
        @sent="onSent"
      />
      <section v-else-if="state.listOpen" :id="listId" class="dock-panel dock-list" aria-label="Chats">
        <ChatDockBar :unread="unread" open :panel-id="listId" @toggle="dock.toggleList()" @full="full(null)" />
        <div class="dock-list__search">
          <label class="dock-list__field">
            <img src="/images/chat/icon-search-20.svg" alt="" width="16" height="16" />
            <span class="dock-visually-hidden">Search chats</span>
            <input v-model="query" type="search" placeholder="Search chats" autocomplete="off" />
          </label>
        </div>
        <div class="dock-list__rows">
          <p v-if="!loaded" class="dock-list__note">Loading chats…</p>
          <div v-else-if="!chats.length" class="dock-list__empty">
            <span class="dock-list__empty-icon"><img src="/images/dock/icon-chat-dots-32.svg" alt="" width="32" height="32" /></span>
            <p class="dock-title dock-title--16">No chats yet</p>
            <p class="dock-list__empty-copy">Join an event’s community to chat with the people going.</p>
            <UiButton size="small" @click="state.listOpen = false; navigateTo('/events')">Explore events</UiButton>
          </div>
          <p v-else-if="!filtered.length" class="dock-list__note">No chats match “{{ query }}”</p>
          <ul v-else class="dock-list__ul">
            <li v-for="c in filtered" :key="c.id"><ChatDockRow :chat="c" :selected="c.id === state.chatId && showConv" @select="select" /></li>
          </ul>
        </div>
      </section>
      <ChatDockBar v-else :unread="unread" :panel-id="listId" @toggle="dock.toggleList()" @full="full(null)" />
    </div>
  </div>
</template>

<style scoped>
.dock {
  position: fixed;
  right: var(--spacing-lg);
  bottom: var(--dock-bottom, 0px);
  z-index: 90; /* above page content and the ticket bar, under the header menus and modals */
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-md);
  pointer-events: none;
}
.dock > * { pointer-events: auto; }
.dock__col { display: flex; flex-direction: column; align-items: flex-end; gap: var(--spacing-sm); pointer-events: none; }
.dock__col > * { pointer-events: auto; }
.dock-list { height: 560px; max-height: calc(100dvh - 120px); }
.dock-list__search { flex: none; padding: var(--spacing-xs) var(--spacing-md); }
.dock-list__field { display: flex; align-items: center; gap: var(--spacing-xs); height: 40px; padding: 0 var(--spacing-md) 0 var(--spacing-sm); border-radius: var(--radius-pill); background: var(--color-background-secondary); }
.dock-list__field:focus-within { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
.dock-list__field input { flex: 1 1 auto; min-width: 0; border: 0; outline: none; background: none; color: var(--color-text-strong); font-family: var(--font-family-base); font-size: var(--text-small-regular-size); line-height: var(--text-small-regular-line); }
.dock-list__field input::placeholder { color: var(--color-text-muted); opacity: 1; }
.dock-list__rows { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; display: flex; flex-direction: column; }
.dock-list__ul { margin: 0; padding: 0; list-style: none; }
.dock-list__note { margin: var(--spacing-lg) var(--spacing-md); color: var(--color-text-muted); font-family: var(--font-family-base); font-size: var(--text-small-regular-size); line-height: var(--text-small-regular-line); text-align: center; }
.dock-list__empty { flex: 1 1 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--spacing-xs); padding: var(--spacing-lg); text-align: center; }
.dock-list__empty-icon { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; margin-bottom: var(--spacing-xs); border-radius: var(--radius-full); background: var(--color-background-secondary); }
.dock-list__empty-copy { max-width: 260px; margin: 0 0 var(--spacing-xs); color: var(--color-text-muted); font-family: var(--font-family-base); font-size: var(--text-small-regular-size); line-height: var(--text-small-regular-line); }
.dock-tab { box-sizing: border-box; display: flex; align-items: center; gap: var(--spacing-xxs); width: 240px; height: 56px; padding: 0 var(--spacing-xs) 0 var(--spacing-sm); border: var(--border-width-default) solid var(--color-border-default); border-bottom: 0; border-radius: var(--radius-md) var(--radius-md) 0 0; background: var(--color-background-primary); box-shadow: var(--shadow-dp2); }
.dock-tab__main { flex: 1 1 auto; min-width: 0; display: flex; align-items: center; gap: var(--spacing-xs); align-self: stretch; padding: 0; border: 0; background: none; cursor: pointer; text-align: left; }
.dock-tab__pic { flex: none; width: 32px; height: 32px; overflow: hidden; border-radius: var(--radius-sm); }
.dock-tab__pic img { display: block; width: 100%; height: 100%; object-fit: cover; }
</style>
<style scoped>
/* Phones keep the Chat page */
@media (max-width: 767px) { .dock { display: none; } }
</style>
