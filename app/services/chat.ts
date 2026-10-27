import type { ChatMessage, ChatPerson, ChatPostMessage, ChatProfile, ChatSummary, NewMessage } from '~/types/chat'
import { mockChatOwnerUsername, mockChats, mockIncoming, mockMessages, mockProfile } from '~/mocks/chat'
import { eventById } from '~/mocks/eventCatalog'
import { mockLatencyMs } from '~/mocks/auth'
import { ticketsHeld } from './tickets'
import { mockRequest } from './mockRequest'

/**
 * Chat service (MOCK). Components call only these functions; replace the
 * bodies with real API calls and keep the signatures.
 * OPEN ITEMS (engineering): endpoints, real-time delivery (websocket / push),
 * paging older messages, photo upload and limits, read receipts (the double
 * tick), unread counts, who can see a profile.
 * The mock keeps everything in memory for this browser tab.
 */
const wait = (ms = mockLatencyMs) => mockRequest(ms)

const chats = structuredClone(mockChats)
const messages = structuredClone(mockMessages)
/** Chats each user joined in this session (from an event page), by username */
const joined: Record<string, ChatSummary[]> = {}

/** All chats a user is in: the demo account's chats, plus any they joined */
function chatsOf(username: string): ChatSummary[] {
  const base = username === mockChatOwnerUsername ? chats : [] // new accounts start with none
  return [...base, ...(joined[username] ?? [])]
}

/**
 * Event chats of the signed-in user, newest first. `hasTicket` (Share Event
 * instead of Buy Ticket in the chat header) comes from the tickets the
 * user's email holds (decision 22 Oct).
 */
export async function listChats(username: string, email?: string): Promise<ChatSummary[]> {
  await wait(150)
  return structuredClone(chatsOf(username))
    .map(c => ({ ...c, hasTicket: ticketsHeld(email, c.eventId) > 0 }))
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
}

/** Is the user already in this event's chat? ("Open Chat" on the event page) */
export async function isInEventChat(username: string, eventId: string): Promise<boolean> {
  const event = eventById[eventId]?.event
  if (!event) return false
  const chatId = event.chatId ?? `event-${event.id}`
  return chatsOf(username).some(c => c.id === chatId)
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

/**
 * New messages from other people, for the chat dock's unread count and its
 * "new message" preview (decision 26 Oct). Returns a function that stops
 * listening.
 * MOCK: no real-time server. For the demo account, one scripted message
 * arrives in "House Party" ~12 s after the page loads, so the preview can be
 * seen. OPEN ITEM (engineering): websocket / push delivery.
 */
export function onIncomingMessage(username: string, listener: (message: ChatPostMessage, chat: ChatSummary) => void): () => void {
  if (username !== mockChatOwnerUsername || deliveredDemo) return () => {}
  const timer = setTimeout(() => {
    deliveredDemo = true
    const chat = [...chats, ...Object.values(joined).flat()].find(c => c.id === mockIncoming.chatId)
    if (!chat) return
    const message: ChatPostMessage = { ...structuredClone(mockIncoming.message), id: `incoming-${Date.now()}`, createdAt: new Date().toISOString() }
    ;(messages[chat.id] ??= []).push(message)
    chat.lastAt = message.createdAt
    chat.lastMessage = { senderFirstName: message.sender.name.split(' ')[0]!, text: message.text ?? 'Photo' }
    chat.unreadCount += 1
    listener(structuredClone(message), structuredClone(chat))
  }, mockIncoming.afterMs)
  return () => clearTimeout(timer)
}
let deliveredDemo = false

