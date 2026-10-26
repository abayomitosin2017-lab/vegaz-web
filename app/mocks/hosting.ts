import type { PlaceSuggestion, TicketKindOption } from '~/types/hosting'

/**
 * Host an event: fixed lists (MOCK). Components never import this file;
 * they use services/hosting.ts.
 */

/** Categories from the live app (screenshot from design, 23 Oct) */
export const hostCategories = [
  'Travels & Exploration',
  'Adventure',
  'Food and Drink',
  'Creative Pursuits',
  'Wellness',
  'Recreation',
  'Sport',
  'Games',
  'Party',
]

/** Ticket Type list (Figma frame 09). Copy as drawn. */
export const ticketKinds: TicketKindOption[] = [
  { id: 'custom', label: 'Custom', description: 'Create custom ticket types', preset: false },
  { id: 'first-to-buy', label: 'First to Buy', description: 'Offer a ticket discount for the first buyer(s)', preset: true },
  { id: 'early-bird', label: 'Early Bird', description: 'Offer an exclusive discount for early bird tickets to encourage early purchase', preset: true },
  { id: 'gender', label: 'Gender-Based', description: 'Set ticket price based on gender', preset: true },
  { id: 'free', label: 'Free', description: 'Create a free ticket', preset: true },
]

/**
 * Location suggestions (Figma frame 04 shows three Lagos addresses for "20,").
 * MOCK: a short list of Lagos places filtered by what is typed.
 * OPEN ITEM (engineering): real place search (e.g. Google Places).
 */
export const placesMock: PlaceSuggestion[] = [
  { id: 'p1', label: '20, Morayo brown street, Lekki' },
  { id: 'p2', label: '20, Aguda Way, Surulere' },
  { id: 'p3', label: '20, Mosunmola bash anthony expressway, Lagos- Ibadan expressway, Nigeria' },
  { id: 'p4', label: 'Admiralty Way, Lekki Phase 1, Lagos' },
  { id: 'p5', label: 'Ajose Adeogun Street, Victoria Island, Lagos' },
  { id: 'p6', label: 'Allen Avenue, Ikeja, Lagos' },
  { id: 'p7', label: 'Herbert Macaulay Way, Yaba, Lagos' },
  { id: 'p8', label: 'Tarkwa Bay Beach, Lagos' },
  { id: 'p9', label: 'Ozumba Mbadiwe Avenue, Victoria Island, Lagos' },
  { id: 'p10', label: 'Bode Thomas Street, Surulere, Lagos' },
]

/**
 * Events the signed-in host already runs (new edition flow, Select event).
 * MOCK: Figma lists sample concert names with no photos; the demo uses six
 * catalog events instead so a new edition opens a real event page with its
 * chat (decision 23 Oct, FLAG for design).
 */
export const hostedEventIds = [
  'faaji-at-the-pent',
  'the-sun-room',
  'bloom-experience',
  'paint-and-sip',
  'kindred-anniversary-picnic',
  'overnight-beach-camping',
]

/** Ids of events created in this session, newest first (memory only) */
export const createdEventIds: string[] = []
