import type { ChatSummary } from '~/types/chat'
import { listChats, markRead } from '~/services/chat'

/**
 * Chat dock state (decision 26 Oct; Figma section "Chat dock — web",
 * 10862:22113), shared by the dock, the header and the Chat page.
 * - listOpen: the chat list is expanded (otherwise the minimized bar shows)
 * - chatId: the one open conversation (opening another replaces it)
 * - chatMinimized: that conversation is shrunk to a tab beside the bar
 * - toast: the new-message preview above the bar
 * Open / minimized and the open chat are kept for this browser tab
 * (sessionStorage, written by the dock).
 */
export interface DockToast { chatId: string; senderName: string; senderAvatar?: string; senderSeed: string; eventTitle: string; text: string }

export function useChatDock() {
  const { user } = useSession()
  const state = useState('chat-dock', () => ({ listOpen: false, chatId: null as string | null, chatMinimized: false }))
  const chats = useState<ChatSummary[]>('chat-dock-chats', () => [])
  const loaded = useState('chat-dock-loaded', () => false)
  /** The chat list couldn't load (shows Try again, decision 27 Oct) */
  const failed = useState('chat-dock-failed', () => false)
  const toast = useState<DockToast | null>('chat-dock-toast', () => null)
  /** Extra space under the dock (the phone / tablet ticket bar on event pages) */
  const bottomOffset = useState('chat-dock-offset', () => 0)

  const unread = computed(() => chats.value.reduce((n, c) => n + c.unreadCount, 0))
  const openChat = computed(() => chats.value.find(c => c.id === state.value.chatId) ?? null)

  async function refresh() {
    if (!user.value) { chats.value = []; loaded.value = false; return }
    try {
      chats.value = await listChats(user.value.username, user.value.email)
      loaded.value = true
      failed.value = false
    } catch {
      if (!loaded.value) failed.value = true // keep showing what we had
    }
  }
  function toggleList() { state.value.listOpen = !state.value.listOpen }
  function minimizeList() { state.value.listOpen = false }
  async function open(chatId: string) {
    state.value.chatId = chatId
    state.value.chatMinimized = false
    if (toast.value?.chatId === chatId) toast.value = null
    await read(chatId)
  }
  async function read(chatId: string) {
    try { await markRead(chatId) } catch { return } // tried again next time
    const c = chats.value.find(x => x.id === chatId)
    if (c) c.unreadCount = 0
  }
  function closeChat() { state.value.chatId = null; state.value.chatMinimized = false }
  function minimizeChat() { state.value.chatMinimized = true }
  function restoreChat() { if (state.value.chatId) open(state.value.chatId) }
  function reset() { state.value = { listOpen: false, chatId: null, chatMinimized: false }; toast.value = null; chats.value = []; loaded.value = false }

  return { state, chats, loaded, failed, toast, unread, openChat, bottomOffset, refresh, toggleList, minimizeList, open, read, closeChat, minimizeChat, restoreChat, reset }
}
