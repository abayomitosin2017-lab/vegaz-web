/**
 * Profile: Activities and Edit Profile (Figma section "Activties and edit
 * profile" 10834:28020, web section 10838:19056).
 * Field names are a proposal for the API contract; engineering to confirm.
 */
import type { Gender } from './auth'

/** Tabs on Activities */
export type ActivityFilter = 'all' | 'created' | 'joined'

/** One event row on Activities */
export interface ActivityItem {
  eventId: string
  title: string
  imageUrl?: string
  /** ISO start; decides Upcoming vs Past */
  startsAt: string
  /** "22 Apr, 14:30 Lagos" (date, 24-hour time, city), as drawn */
  dateLine: string
  /** People in the event, by gender (the memoji counts) */
  femaleCount: number
  maleCount: number
  /** Places still free; null when there is no limit (no chip) */
  slotsLeft: number | null
  /** You host it (Created) or you're in it (Joined) */
  role: 'created' | 'joined'
  /** Already happened (Past group, "Ended" chip) */
  ended: boolean
}

/** What Edit Profile can change. Email is shown but locked (decision 26 Oct). */
export interface ProfileChanges {
  firstName: string
  lastName: string
  username: string
  gender?: Gender
  /** "YYYY-MM-DD" */
  birthday?: string
  bio?: string
  /** Up to 3; the first is the profile photo */
  photos: string[]
}
