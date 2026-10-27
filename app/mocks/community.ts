import type { EventMember } from '~/types/event'
import type { Gender } from '~/types/auth'
import { placeholderPhoto } from './placeholders'

/**
 * Everyone in an event's community, for the "View all" modal (decision
 * 27 Oct). MOCK: the catalog only names the 5 people in the Community row,
 * so the rest are invented here (deterministic per event, so the list is the
 * same on every visit) up to the event's community count. Names are made up;
 * about 2 in 3 have a stock photo, the rest show the letter avatar.
 * Mock data only: components never import this file.
 */
const FIRST: [string, Gender][] = [
  ['Tunde', 'male'], ['Ngozi', 'female'], ['Emeka', 'male'], ['Funke', 'female'], ['Kunle', 'male'], ['Zainab', 'female'],
  ['Ibrahim', 'male'], ['Chioma', 'female'], ['Seyi', 'male'], ['Aisha', 'female'], ['Obinna', 'male'], ['Yetunde', 'female'],
  ['Musa', 'male'], ['Adaeze', 'female'], ['Wale', 'male'], ['Halima', 'female'], ['Nnamdi', 'male'], ['Tolu', 'female'],
  ['Gbenga', 'male'], ['Ifunanya', 'female'], ['Kayode', 'male'], ['Damilola', 'female'], ['Chuka', 'male'], ['Morenike', 'female'],
]
const LAST = ['Adebayo', 'Okeke', 'Balogun', 'Okonkwo', 'Bello', 'Eze', 'Afolabi', 'Nwachukwu', 'Ogunleye', 'Danjuma', 'Okafor', 'Akande', 'Ibe', 'Ogbonna', 'Salami', 'Uzor']

/** Small seeded random so each event's list is stable */
function seeded(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

const cache: Record<string, EventMember[]> = {}

/** The known row members first, then invented people up to `total` */
export function communityOf(eventId: string, known: EventMember[], total: number): EventMember[] {
  const key = `${eventId}:${total}`
  if (cache[key]) return cache[key]
  const rand = seeded(eventId)
  const list = [...known]
  for (let i = list.length; i < total; i++) {
    const [first, gender] = FIRST[Math.floor(rand() * FIRST.length)]!
    const last = LAST[Math.floor(rand() * LAST.length)]!
    const username = `${first}${last}${i}`.toLowerCase()
    const avatarUrl = rand() < 0.66 ? placeholderPhoto(1 + Math.floor(rand() * 24)) : undefined
    list.push({ person: { id: `m-${eventId}-${i}`, name: `${first} ${last}`, username, avatarUrl }, gender })
  }
  return (cache[key] = list)
}
