import type { SessionUser } from '~/types/auth'
import type { ActivityItem, ProfileChanges } from '~/types/profile'
import { catalog, eventById } from '~/mocks/eventCatalog'
import { mockActivityStats, mockProfileLatencyMs } from '~/mocks/profile'
import { listChats } from './chat'
import { ticketsHeld } from './tickets'
import { checkUsername } from './auth'
import { mockRequest } from './mockRequest'

/**
 * Profile service (MOCK): Activities and Edit Profile. Components call only
 * these functions; replace the bodies with real API calls and keep the
 * signatures.
 * OPEN ITEMS (engineering): endpoints; photo upload (the demo keeps picked
 * photos as in-browser links); username rules; who sees the bio.
 */
const wait = (ms = mockProfileLatencyMs) => mockRequest(ms)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "22 Apr, 14:30 Lagos": the event's own clock time (as written in startsAt) and its city */
export function activityDateLine(startsAt: string, location: string): string {
  const m = startsAt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  const city = location.split(',').map(s => s.trim()).filter(Boolean).pop() ?? ''
  if (!m) return city
  const [, , mo, d, hh, mm] = m
  return `${Number(d)} ${MONTHS[Number(mo) - 1]}, ${hh}:${mm} ${city}`.trim()
}

/**
 * The signed-in user's events for Activities, upcoming first (soonest
 * first), then past (latest first).
 * Created = events they host (including ones published in this session).
 * Joined = events they hold a ticket for or whose chat they're in
 * (decision 26 Oct). An event they host only shows under Created.
 */
export async function listActivities(user: SessionUser, now = new Date()): Promise<ActivityItem[]> {
  const chats = await listChats(user.username, user.email)
  await wait()
  const inChat = new Set(chats.map(c => c.eventId).filter(Boolean))
  const items: ActivityItem[] = []
  for (const { event, tickets } of catalog) {
    const hosting = event.host.username === user.username
    const joined = !hosting && (inChat.has(event.id) || ticketsHeld(user.email, event.id) > 0)
    if (!hosting && !joined) continue
    const stats = mockActivityStats[event.id]
    const counted = event.members.map(m => m.gender)
    const female = stats?.female ?? counted.filter(g => g === 'female').length
    const male = stats?.male ?? counted.filter(g => g === 'male').length
    const limits = tickets.map(t => t.remaining ?? t.maxQuantity)
    const slots = stats ? stats.slotsLeft
      : limits.length && limits.every(n => typeof n === 'number') ? Math.max(0, limits.reduce<number>((a, n) => a + (n ?? 0), 0) - Math.max(0, event.communityCount - 1))
      : null
    const ended = new Date(event.startsAt).getTime() < now.getTime()
    items.push({
      eventId: event.id,
      title: event.title,
      imageUrl: event.imageUrl,
      startsAt: event.startsAt,
      dateLine: activityDateLine(event.startsAt, event.location),
      femaleCount: female,
      maleCount: male,
      slotsLeft: ended ? null : slots,
      role: hosting ? 'created' : 'joined',
      ended,
    })
  }
  const t = (i: ActivityItem) => new Date(i.startsAt).getTime()
  return [
    ...items.filter(i => !i.ended).sort((a, b) => t(a) - t(b)),
    ...items.filter(i => i.ended).sort((a, b) => t(b) - t(a)),
  ]
}

/** Does this event exist (rows open the event page)? */
export function activityExists(eventId: string): boolean {
  return !!eventById[eventId]
}

/** Items counted for "Profile N% Complete" (equal share each, decision 26 Oct) */
export function profileCompletion(p: Partial<SessionUser>): number {
  const filled = [
    p.firstName?.trim(), p.lastName?.trim(), p.username?.trim(), p.email?.trim(),
    p.gender, p.birthday, p.bio?.trim(), (p.photos?.length ?? 0) > 0 ? 'photo' : '',
  ].filter(Boolean).length
  return Math.round((filled / 8) * 100)
}

/** Words in a bio (the "0/100 words" counter) */
export const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0)
export const BIO_MAX_WORDS = 100

/**
 * Saves Edit Profile. Returns the updated user, or the reason it failed.
 * The username is checked only when it changed.
 */
export async function saveProfile(user: SessionUser, changes: ProfileChanges): Promise<{ ok: true; user: SessionUser } | { ok: false; field: 'username'; message: string }> {
  const username = changes.username.trim()
  if (username !== user.username) {
    const { available } = await checkUsername(username)
    if (!available) return { ok: false, field: 'username', message: 'This username is taken. Try another one.' }
  }
  await wait()
  const photos = changes.photos.slice(0, 3)
  return {
    ok: true,
    user: {
      ...user,
      firstName: changes.firstName.trim(),
      lastName: changes.lastName.trim(),
      username,
      gender: changes.gender,
      birthday: changes.birthday,
      bio: changes.bio?.trim() || undefined,
      photos,
      avatarUrl: photos[0] ?? user.avatarUrl,
    },
  }
}

/** Saves the birthday from the prompt */
export async function saveBirthday(user: SessionUser, birthday: string): Promise<SessionUser> {
  await wait()
  return { ...user, birthday }
}

/** Saves the bio from the "introduce yourself" prompt (before a first chat join) */
export async function saveBio(user: SessionUser, bio: string): Promise<SessionUser> {
  await wait()
  return { ...user, bio: bio.trim() }
}

/** Keeps the first BIO_MAX_WORDS words (typing or pasting past the cap) */
export function capWords(text: string): string {
  if (countWords(text) <= BIO_MAX_WORDS) return text
  return text.match(new RegExp(`^\\s*(?:\\S+\\s+){${BIO_MAX_WORDS - 1}}\\S+`))?.[0] ?? text
}

/** Saves the gender from the prompt */
export async function saveGender(user: SessionUser, gender: NonNullable<SessionUser['gender']>): Promise<SessionUser> {
  await wait()
  return { ...user, gender }
}
