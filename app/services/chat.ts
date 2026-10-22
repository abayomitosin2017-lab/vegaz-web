import type { ChatMessage, ChatPerson, ChatPostMessage, ChatProfile, ChatSummary, NewMessage } from '~/types/chat'
import { mockChatOwnerUsername, mockChats, mockMessages, mockProfile } from '~/mocks/chat'
import { eventById } from '~/mocks/eventCatalog'
import { mockLatencyMs } from '~/mocks/auth'

/**
 * Chat service (MOCK). Components call only these functions; replace the
 * bodies with real API calls and keep the signatures.
 * OPEN ITEMS (engineering): endpoints, real-time delivery (websocket / push),
 * paging older messages, photo upload and limits, read receipts (the double
 * tick), unread counts, who can see a profile.
 * The mock keeps everything in memory for this browser tab.
 */
const wait = (ms = mockLatencyMs) => new Promise(resolve => setTimeout(resolve, ms))

const chats = structuredClone(mockChats)
const messages = structuredClone(mockMessages)
/** Chats each user joined in this session (from an event page), by username */
const joined: Record<string, ChatSummary[]> = {}

/** All chats a user is in: the demo account's chats, plus any they joined */
function chatsOf(username: string): ChatSummary[] {
  const base = username === mockChatOwnerUsername ? chats : [] // new accounts start with none
  return [...base, ...(joined[username] ?? [])]
}

/** Event chats of the signed-in user, newest first */
export async function listChats(username: string): Promise<ChatSummary[]> {
  await wait(150)
  return structuredClone(chatsOf(username)).sort((a, b) => b.lastAt.localeCompare(a.lastAt))
}

/**
 * Joins an event's community (free) and returns its chat id, so the caller
 * can open the chat (decision 22 Oct). Joining twice is harmless.
 * Events without a chat yet get one, with a "You just joined" notice and a
 * welcome from the host.
 */
export async function joinEventChat(username: string, eventId: string): Promise<string> {
  await wait(200)
  const entry = eventById[eventId]
  if (!entry) throw new Error(`Unknown event ${eventId}`)
  const { event } = entry
  const chatId = event.chatId ?? `event-${event.id}`
  if (chatsOf(username).some(c => c.id === chatId)) return chatId

  const now = new Date().toISOString()
  const existing = chats.find(c => c.id === chatId)
  const hostFirst = event.host.name.split(' ')[0]!
  const welcome = `Welcome to ${event.title}! Say hi to everyone.`
  const summary: ChatSummary = existing
    ? { ...structuredClone(existing), unreadCount: 0 }
    : { id: chatId, title: event.title, imageUrl: event.imageUrl, eventId: event.id, participantCount: event.communityCount, lastMessage: { senderFirstName: hostFirst, text: welcome }, lastAt: now, unreadCount: 0 }
  ;(joined[username] ??= []).push(summary)
  const list = (messages[chatId] ??= [])
  if (!existing) list.push({ kind: 'post', id: `${chatId}-welcome`, chatId, sender: event.host, mine: false, text: welcome, createdAt: now })
  list.push({ kind: 'system', id: `${chatId}-joined-${username}`, chatId, text: 'You just joined', createdAt: now })
  return chatId
}

export async function getMessages(chatId: string): Promise<ChatMessage[]> {
  await wait(150)
  return structuredClone(messages[chatId] ?? [])
}

/** Marks a chat as read (clears its unread count) */
export async function markRead(chatId: string): Promise<void> {
  for (const c of [...chats, ...Object.values(joined).flat()]) if (c.id === chatId) c.unreadCount = 0
}

export async function sendMessage(chatId: string, me: ChatPerson, draft: NewMessage): Promise<ChatPostMessage> {
  await wait(150)
  const message: ChatPostMessage = {
    kind: 'post',
    id: `local-${Date.now()}`,
    chatId,
    sender: me,
    mine: true,
    text: draft.text?.trim() || undefined,
    photos: draft.photos?.length ? draft.photos : undefined,
    replyTo: draft.replyTo ? { ...draft.replyTo } : undefined,
    createdAt: new Date().toISOString(),
  }
  ;(messages[chatId] ??= []).push(message)
  const chat = [...chats, ...Object.values(joined).flat()].find(c => c.id === chatId)
  if (chat) {
    chat.lastAt = message.createdAt
    // FLAG: how your own last message reads in the list is not designed
    const n = message.photos?.length ?? 0
    chat.lastMessage = { senderFirstName: 'You', text: message.text ?? (n > 1 ? `${n} photos` : 'Photo') }
  }
  return structuredClone(message)
}

export async function getProfile(person: ChatPerson): Promise<ChatProfile> {
  await wait(150)
  return mockProfile(person)
}
