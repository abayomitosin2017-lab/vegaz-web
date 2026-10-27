/**
 * Event chats. Field names are a proposal for the API contract and need
 * engineering confirmation. Every event has one group chat.
 */
import type { Gender } from './auth'

export interface ChatPerson {
  id: string
  /** Display name, e.g. "Oreban Jude" */
  name: string
  username: string
  avatarUrl?: string
}

/** One row in the chat list */
export interface ChatSummary {
  id: string
  /** Event title, e.g. "House Party" */
  title: string
  imageUrl?: string
  participantCount: number
  /** Preview line, e.g. "Oreban: Invite goes out tomorrow." */
  lastMessage: { senderFirstName: string; text: string }
  /** ISO date-time of the last message */
  lastAt: string
  unreadCount: number
  /** The event this chat belongs to (opens its details page) */
  eventId?: string
  /** The signed-in user holds a ticket for this event (bought or assigned):
      "Share Event" replaces "Buy Ticket". Worked out by the service. */
  hasTicket?: boolean
}

export interface ReplyQuote {
  messageId: string
  senderUsername: string
  text: string
}

interface MessageBase {
  id: string
  chatId: string
  /** ISO date-time */
  createdAt: string
}

/** Something someone said: text, photos, or photos with a caption */
export interface ChatPostMessage extends MessageBase {
  kind: 'post'
  sender: ChatPerson
  /** True for the signed-in user's own messages (purple, right-aligned) */
  mine: boolean
  text?: string
  /** One or more photos (Figma shows 1 and 3; 2, 4 and 5+ follow the same style) */
  photos?: string[]
  replyTo?: ReplyQuote
  /** Local only: couldn't be sent; the bubble offers Try again (decision 27 Oct) */
  failed?: boolean
}

/** A notice in the timeline, e.g. "Asherkine just joined" */
export interface ChatSystemMessage extends MessageBase {
  kind: 'system'
  text: string
}

export type ChatMessage = ChatPostMessage | ChatSystemMessage

/** Profile shown in the side panel */
export interface ChatProfile extends ChatPerson {
  gender?: Gender
  photoUrl?: string
  events: { id: string; title: string; imageUrl?: string; dateLabel: string }[]
}

export interface NewMessage {
  text?: string
  /** Local file previews (object URLs) in this mock; real uploads later */
  photos?: string[]
  replyTo?: ReplyQuote
}
