/**
 * Footer content, copied exactly from Figma Footer (node 9864:56123).
 * "Explore Events" opens the All events page (decision 22 Oct). "Hot events
 * right now" and "Upcoming events" removed (decision 27 Oct). "Host an Event"
 * starts hosting and Terms / Privacy open the legal pages (decision 26 Oct).
 * OPEN ITEM: every other `href` is a placeholder ('#'). Real routes and social
 * URLs are not in Figma and must be supplied.
 * FLAG: "X Formerly Twitter)" is missing its opening bracket in Figma.
 * Kept as designed until design confirms.
 */
export interface FooterLink { label: string; href: string; /** 'host' starts Host an Event (logs in first) instead of following href */ action?: 'host' }
export interface FooterColumn { heading: string; links: FooterLink[] }

export const footerColumns: FooterColumn[] = [
  {
    heading: 'Discover',
    links: [
      { label: 'Explore Events', href: '/events' },
      { label: 'Add your Event', href: '/host', action: 'host' }, // decision 27 Oct (was "Host an Event", before that "Create an Event")
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Vegaz', href: '#' },
      { label: 'Our Services', href: '#' },
      { label: 'Contact Vegaz', href: '#' },
    ],
  },
  {
    heading: 'Social',
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'Tiktok', href: '#' },
      { label: 'X Formerly Twitter)', href: '#' },
      { label: 'Linkedin', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms', href: '/legal/terms' },
      { label: 'Privacy', href: '/legal/privacy' },
    ],
  },
]

export const appStoreLinks = [
  { label: 'Download on the App Store', href: '#', image: '/images/badge-app-store.png' },
  { label: 'Get it on Google Play', href: '#', image: '/images/badge-google-play.png' },
]

/** Figma 10875:35486 (26 Oct) */
export const copyrightText = '© Vegaz 2026. All rights reserved.'
