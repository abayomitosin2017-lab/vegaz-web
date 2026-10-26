/**
 * Host an event (Figma section 10754:68066, desktop frames, 23 Oct).
 * Field names are a proposal for the API contract; engineering to confirm.
 */

/** Ticket types offered in "Ticket Type" (Figma frame 09) */
export type TicketKind = 'custom' | 'first-to-buy' | 'early-bird' | 'gender' | 'free'

export interface TicketKindOption {
  id: TicketKind
  label: string
  description: string
  /** Shows the green "Preset" chip */
  preset: boolean
}

/** Who can join (Participants dialog) */
export type Participants = 'all' | 'female' | 'male'

/** Price and quantity for one group of guests */
export interface TicketPriceLine {
  /** Naira; 0 for a Free ticket */
  price: number
  /** null = "Unlimited Slot" */
  quantity: number | null
  description: string
}

/** A ticket the host has created (a card in "Your tickets") */
export interface DraftTicket {
  id: string
  kind: TicketKind
  /** Custom: typed by the host. Presets: the preset name (e.g. "FIRST TO BUY") */
  name: string
  /**
   * One price line. (Older drafts: gender-based had two, female then male.)
   */
  lines: TicketPriceLine[]
  /**
   * Gender-based only (decision 26 Oct): the form asks for both groups at
   * once, then "Add" creates two tickets, "FEMALE TICKET" and "MALE TICKET",
   * each with its own price, quantity and description.
   */
  gender?: 'female' | 'male'
}

/** One "What to expect" item */
export interface DraftExpectation {
  id: string
  title: string
  description: string
  /** Picked image (object URL in this demo) */
  imageUrl?: string
}

/** A photo picked for the event (object URL in this demo) */
export interface DraftPhoto {
  id: string
  url: string
  /**
   * Where the cover is cropped, 0-100 (CSS object-position). Only the cover
   * uses it. OPEN ITEM: the real crop (sent to the server or done on upload).
   */
  focusX: number
  focusY: number
}

/** Everything the host fills in, sent when they finish */
export interface EventDraft {
  title: string
  description: string
  photos: DraftPhoto[]
  /** Index in `photos` of the cover image */
  coverIndex: number
  /** "YYYY-MM-DD" and "HH:mm" (local time) */
  date: string
  time: string
  location: string
  category: string | null
  participants: Participants
  tickets: DraftTicket[]
  expectations: DraftExpectation[]
  /** New edition only: the event it continues */
  editionOf?: string
}

/** An event the host already runs (Select event, new edition flow) */
export interface HostedEventOption {
  id: string
  title: string
  location: string
  dateLabel: string
  imageUrl?: string
}

/** A place suggestion in the Location dialog */
export interface PlaceSuggestion {
  id: string
  label: string
}
