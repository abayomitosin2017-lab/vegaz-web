/**
 * Placeholder photos of people, from Figma frame 10687:56254 ("Profiles",
 * 42 round 80px portraits; 24 are used, one was left out as unsuitable).
 * Used for: avatars (decision 21 Oct), the profile-panel photo, and the demo
 * photos sent in chat (decision 22 Oct). Event gallery photos are stock
 * photos in public/images/event-photos/ instead (decision 22 Oct).
 *
 * FLAG: the Figma download returned 403, so these are 80 x 80 screenshots of
 * each node. Sharp at avatar sizes (32-48px); soft on the large profile
 * photo. Swap in 2x exports (same file names) when available.
 *
 * Two versions of each portrait:
 *   person-NN.png         round original (grey corners): round avatars
 *   person-NN-square.jpg  centre cut without the corners: the profile-panel
 *                         photo and photos sent in chat
 *
 * Mock data only: components never import this file.
 */
/** [round, square] for each portrait, written out in full so tools can find the files */
const PORTRAITS: [string, string][] = [
  ['/images/placeholders/person-01.png', '/images/placeholders/person-01-square.jpg'],
  ['/images/placeholders/person-02.png', '/images/placeholders/person-02-square.jpg'],
  ['/images/placeholders/person-03.png', '/images/placeholders/person-03-square.jpg'],
  ['/images/placeholders/person-04.png', '/images/placeholders/person-04-square.jpg'],
  ['/images/placeholders/person-05.png', '/images/placeholders/person-05-square.jpg'],
  ['/images/placeholders/person-06.png', '/images/placeholders/person-06-square.jpg'],
  ['/images/placeholders/person-07.png', '/images/placeholders/person-07-square.jpg'],
  ['/images/placeholders/person-08.png', '/images/placeholders/person-08-square.jpg'],
  ['/images/placeholders/person-09.png', '/images/placeholders/person-09-square.jpg'],
  ['/images/placeholders/person-10.png', '/images/placeholders/person-10-square.jpg'],
  ['/images/placeholders/person-11.png', '/images/placeholders/person-11-square.jpg'],
  ['/images/placeholders/person-12.png', '/images/placeholders/person-12-square.jpg'],
  ['/images/placeholders/person-13.png', '/images/placeholders/person-13-square.jpg'],
  ['/images/placeholders/person-14.png', '/images/placeholders/person-14-square.jpg'],
  ['/images/placeholders/person-15.png', '/images/placeholders/person-15-square.jpg'],
  ['/images/placeholders/person-16.png', '/images/placeholders/person-16-square.jpg'],
  ['/images/placeholders/person-17.png', '/images/placeholders/person-17-square.jpg'],
  ['/images/placeholders/person-18.png', '/images/placeholders/person-18-square.jpg'],
  ['/images/placeholders/person-19.png', '/images/placeholders/person-19-square.jpg'],
  ['/images/placeholders/person-20.png', '/images/placeholders/person-20-square.jpg'],
  ['/images/placeholders/person-21.png', '/images/placeholders/person-21-square.jpg'],
  ['/images/placeholders/person-22.png', '/images/placeholders/person-22-square.jpg'],
  ['/images/placeholders/person-23.png', '/images/placeholders/person-23-square.jpg'],
  ['/images/placeholders/person-24.png', '/images/placeholders/person-24-square.jpg'],
]

/** Round portrait n (1-24, wraps), for avatars */
export function placeholderPhoto(n: number): string {
  return PORTRAITS[(((n - 1) % PORTRAITS.length) + PORTRAITS.length) % PORTRAITS.length]![0]
}

/** The square version of a round placeholder (profile panel, chat photos) */
export function toSquare(avatarUrl?: string): string | undefined {
  return PORTRAITS.find(([round]) => round === avatarUrl)?.[1] ?? avatarUrl
}
