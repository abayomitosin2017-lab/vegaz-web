import type { Gender } from './auth'
import type { ChatPerson } from './chat'

/**
 * Event as shown on an event card (EventCard). Field names are a proposal for the API
 * contract and need engineering confirmation.
 */
export interface EventSummary {
  id: string
  title: string
  /** Area and city exactly as displayed, e.g. "Victoria Island, Lagos" */
  location: string
  /**
   * Date and time as displayed, e.g. "7:00PM, 18 Jan 2026".
   * OPEN ITEM: the API will likely send an ISO date; the display format then
   * needs to be agreed (Figma shows "h:mmA, D MMM YYYY").
   */
  dateLabel: string
  /** Category chip text, e.g. "Party", "Food & Drinks" */
  category: string
  /** Cover image (the event flier). Missing -> grey placeholder. */
  imageUrl?: string
}

export interface HomeEvents {
  happeningThisWeek: EventSummary[]
  hotRightNow: EventSummary[]
  upcoming: EventSummary[]
  exploreAll: EventSummary[]
}

/** One "What to expect" row (Figma event details) */
export interface EventExpectation {
  title: string
  description: string
  imageUrl?: string
}

/** Someone in an event's community */
export interface EventMember {
  person: ChatPerson
  gender?: Gender
  /** Shows the green "Host" badge */
  isHost?: boolean
}

/**
 * Everything on the event details page (Figma section "event details",
 * 10715:65072). Field names are a proposal for the API contract.
 * Ticket types come separately from services/tickets.ts.
 */
export interface EventDetails extends EventSummary {
  /** Gallery photos, flier first */
  photos: string[]
  /** Full address line, e.g. "44B Ajose Adeogun, Victoria Island, Lagos" */
  address: string
  /** ISO start date-time; drives the month/day tile */
  startsAt: string
  host: ChatPerson
  about: string
  expectations: EventExpectation[]
  /** Everyone in the community (the "(24)" count) */
  communityCount: number
  /** The people shown in the Community row (host first) */
  members: EventMember[]
  /** The event's group chat, if it already exists */
  chatId?: string
}
