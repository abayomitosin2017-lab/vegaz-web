/**
 * Footer content, copied exactly from Figma Footer (node 9864:56123).
 * "Explore Events" opens the All events page (decision 22 Oct).
 * OPEN ITEM: every other `href` is a placeholder ('#'). Real routes and social
 * URLs are not in Figma and must be supplied.
 * FLAG: "X Formerly Twitter)" is missing its opening bracket in Figma.
 * Kept as designed until design confirms.
 */
export interface FooterLink { label: string; href: string }
export interface FooterColumn { heading: string; links: FooterLink[] }

export const footerColumns: FooterColumn[] = [
  {
    heading: 'Discover',
    links: [
      { label: 'Explore Events', href: '/events' },
      { label: 'Create an Event', href: '#' },
      { label: 'Hot events right now', href: '#' },
      { label: 'Upcoming events', href: '#' },
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
      { label: 'Terms', href: '#' },
      { label: 'Privacy', href: '#' },
    ],
  },
]

export const appStoreLinks = [
  { label: 'Download on the App Store', href: '#', image: '/images/badge-app-store.png' },
  { label: 'Get it on Google Play', href: '#', image: '/images/badge-google-play.png' },
]

/** FLAG: year 2077 is as designed in Figma; confirm with design. */
export const copyrightText = '© 2077 Vegaz. All rights reserved.'
