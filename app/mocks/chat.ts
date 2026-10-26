import type { ChatMessage, ChatPerson, ChatPostMessage, ChatProfile, ChatSummary } from '~/types/chat'
import { mockExistingAccount } from './auth'
import { placeholderPhoto, toSquare } from './placeholders'
import { catalog, eventById } from './eventCatalog'
import { genderOf, people } from './people'

/**
 * Demo chats copied from the Figma chat section (10681:52423): list from
 * "Desktop - 54", messages from Desktop 54 / 55 / 56, profile panel from 57.
 * Do not import this file from components; use services/chat.ts.
 *
 * Only the demo login account (Esther Marie) has chats. New sign-ups have
 * none, which shows the "no chats yet" empty state.
 *
 * FLAGS (demo data, not from Figma):
 * - Decision 22 Oct: chat titles and photos come from the event fliers
 *   (eventCatalog.ts), replacing the Figma demo titles ("House Party",
 *   "Picnic at Legacy Museum, Yaba"...). Chat ids are unchanged.
 * - Participant counts = the event's community count (eventCatalog.ts).
 * - The first three chats show the Figma conversations as drawn; their list
 *   previews (also from Figma) don't match their last message. Chats Figma
 *   doesn't show have one message matching their list preview.
 * - Profile panel "All Events" (decision 22 Oct): real demo events with
 *   their fliers, replacing Figma's sample list (which had no images). The
 *   person's own events first (host or community member in eventCatalog.ts),
 *   then others, 5 in all, so every profile shows a full list.
 */

const at = (daysAgo: number, h: number, m: number) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

/** The signed-in demo user as a message sender */
export const mockMe: ChatPerson = {
  id: 'u-me',
  name: `${mockExistingAccount.firstName} ${mockExistingAccount.lastName}`,
  username: mockExistingAccount.username,
  avatarUrl: mockExistingAccount.avatarUrl,
}

export const mockChatOwnerUsername = mockExistingAccount.username

/** Title, photo and link of the event a chat belongs to */
const fromEvent = (eventId: string) => {
  const { title, imageUrl, communityCount } = eventById[eventId]!.event
  return { title, imageUrl, eventId, participantCount: communityCount }
}

export const mockChats: ChatSummary[] = [
  { id: 'house-party', ...fromEvent('ultimate-party-experience'), lastMessage: { senderFirstName: 'Oreban', text: 'Invite goes out tomorrow.' }, lastAt: at(0, 22, 34), unreadCount: 3 },
  { id: 'picnic-legacy', ...fromEvent('kindred-anniversary-picnic'), lastMessage: { senderFirstName: 'John', text: 'I’ll bring a picnic blanket.' }, lastAt: at(0, 5, 22), unreadCount: 90 },
  { id: 'ikorodu-block', ...fromEvent('faaji-at-the-pent'), lastMessage: { senderFirstName: 'Tobi', text: 'Who’s coming on Saturday?' }, lastAt: at(0, 5, 22), unreadCount: 128 },
  { id: 'slides-shots', ...fromEvent('lalale-friday-24-apr'), lastMessage: { senderFirstName: 'Vivian', text: 'I’ll bring the drinks!' }, lastAt: at(1, 18, 0), unreadCount: 2600 },
  { id: 'phelinas', ...fromEvent('all-white-at-the-balkony'), lastMessage: { senderFirstName: 'Ada', text: 'Can I bring a friend?' }, lastAt: '2025-02-02T15:00:00', unreadCount: 0 },
  { id: 'swimming', ...fromEvent('overnight-beach-camping'), lastMessage: { senderFirstName: 'Sandra', text: 'See you at the beach!' }, lastAt: '2025-02-02T09:00:00', unreadCount: 0 },
  { id: 'house-party-2', ...fromEvent('reboot'), lastMessage: { senderFirstName: 'Sam', text: 'Thanks for a great night!' }, lastAt: '2025-01-05T23:00:00', unreadCount: 0 },
]

/* Who holds tickets lives in mocks/orders.ts: the demo account holds tickets
   for Ultimate Party Experience and Faaji at the Pent, so those chats show
   "Share Event" (services/chat.ts works out hasTicket). */

/** Photos sent in chat (decision 22 Oct): people photos, using the square
 * cut of the Figma portraits. FLAG: 80px sources, so they look soft at chat
 * photo size (259px) and in the full-size viewer. */
const photoOf = (n: number) => toSquare(placeholderPhoto(n))!

export const mockMessages: Record<string, ChatMessage[]> = {
  // Desktop - 54
  'house-party': [
    { kind: 'post', id: 'm1', chatId: 'house-party', sender: people.oreban, mine: false, text: 'Hey everyone! I just confirmed the venue for Saturday. We’re hosting at my place in Lekki.', createdAt: at(0, 22, 30) },
    { kind: 'post', id: 'm2', chatId: 'house-party', sender: mockMe, mine: true, text: 'Perfect! I’ll send the playlist and a few drink options by tomorrow morning.', createdAt: at(0, 22, 31) },
    { kind: 'post', id: 'm3', chatId: 'house-party', sender: people.oreban, mine: false, text: 'Great. I’ll also send the address and parking details so nobody gets lost.', createdAt: at(0, 22, 32) },
    { kind: 'system', id: 'm4', chatId: 'house-party', text: 'Asherkine just joined', createdAt: at(0, 22, 32) },
    { kind: 'post', id: 'm5', chatId: 'house-party', sender: mockMe, mine: true, text: 'Sounds good. Let’s keep the guest list to 100 for now so we don’t run out of space.', createdAt: at(0, 22, 33) },
  ],
  // Desktop - 55 (three-photo message)
  'picnic-legacy': [
    { kind: 'post', id: 'p1', chatId: 'picnic-legacy', sender: people.janet, mine: false, photos: [photoOf(16), photoOf(21), photoOf(24)], createdAt: at(0, 22, 30) },
    { kind: 'post', id: 'p2', chatId: 'picnic-legacy', sender: mockMe, mine: true, text: 'Sounds good. Let’s keep the guest list to 100 for now so we don’t run out of space.', createdAt: at(0, 22, 33) },
  ],
  // Desktop - 56 (own photo with caption)
  'ikorodu-block': [
    { kind: 'post', id: 'i1', chatId: 'ikorodu-block', sender: mockMe, mine: true, photos: [photoOf(3)] /* Esther's own portrait: her intro message */, text: 'Hi everyone, my name is Esther and i’m an actor, my hobbies are eating and cooking, I’m glad to meet y’all', createdAt: at(0, 22, 30) },
    { kind: 'post', id: 'i2', chatId: 'ikorodu-block', sender: people.oreban, mine: false, text: 'Great. I’ll also send the address and parking details so nobody gets lost.', createdAt: at(0, 22, 32) },
  ],
  'slides-shots': [
    { kind: 'post', id: 's1', chatId: 'slides-shots', sender: people.vivian, mine: false, text: 'I’ll bring the drinks!', createdAt: at(1, 18, 0) },
  ],
  phelinas: [
    { kind: 'post', id: 'f1', chatId: 'phelinas', sender: people.ada, mine: false, text: 'Can I bring a friend?', createdAt: '2025-02-02T15:00:00' },
  ],
  swimming: [
    { kind: 'post', id: 'w1', chatId: 'swimming', sender: people.sandra, mine: false, text: 'See you at the beach!', createdAt: '2025-02-02T09:00:00' },
  ],
  'house-party-2': [
    { kind: 'post', id: 'h1', chatId: 'house-party-2', sender: people.sam, mine: false, text: 'Thanks for a great night!', createdAt: '2025-01-05T23:00:00' },
  ],
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** Figma format "22 Apr, 14:30 Lagos": day, time and the place's last part */
const profileDate = (startsAt: string, location: string) => {
  const [date, time] = startsAt.split('T') as [string, string]
  const [, month, day] = date.split('-').map(Number) as [number, number, number]
  const place = location.split(',').pop()!.trim()
  return `${day} ${MONTHS[month - 1]}, ${time.slice(0, 5)} ${place}`
}
/** Events on a person's profile: theirs first (hosting or in the community), then others */
function profileEventsOf(personId: string): ChatProfile['events'] {
  const isTheirs = (c: (typeof catalog)[number]) => c.event.host.id === personId || c.event.members.some(m => m.person.id === personId)
  const seed = [...personId].reduce((n, ch) => n + ch.charCodeAt(0), 0)
  const others = catalog.filter(c => !isTheirs(c))
  const rotated = [...others.slice(seed % others.length), ...others.slice(0, seed % others.length)]
  return [...catalog.filter(isTheirs), ...rotated].slice(0, 5).map(({ event: e }) => ({
    id: e.id,
    title: e.title,
    imageUrl: e.imageUrl,
    dateLabel: profileDate(e.startsAt, e.location),
  }))
}

export function mockProfile(person: ChatPerson): ChatProfile {
  return { ...person, photoUrl: toSquare(person.avatarUrl), gender: genderOf(person.id), events: profileEventsOf(person.id) }
}

/**
 * Demo only (decision 26 Oct): the message that "arrives" while browsing so
 * the chat dock's new-message preview can be seen. Not from Figma.
 */
export const mockIncoming = {
  chatId: 'house-party',
  afterMs: 12000,
  message: { kind: 'post', id: 'incoming', chatId: 'house-party', sender: people.oreban, mine: false, text: 'Doors open at 7. Bring your best vibes and someone you love!', createdAt: '' } as ChatPostMessage,
}

