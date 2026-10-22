/**
 * Event fliers supplied by design (22 Oct) and the event details printed on
 * them. Used as mock events and as placeholder event images (home cards,
 * chat list and chat header). Mock data only: components never import this.
 *
 * Images: public/images/events/flier-*.jpg, resized to 720px wide. Two were
 * phone screenshots and are cropped to the flier (Owanbe Electro, Ultimate
 * Party Experience); the duplicate Beach Camping screenshot is not used.
 *
 * FLAGS (filled in where the flier doesn't say):
 * - Category: picked from the app's categories to suit each event.
 * - No time on the flier: Bloom, Beach Camping, Explore Obudu (date only).
 * - No area on the flier: Paint & Sip, MOV3E, Sketch Cafe ("Lagos").
 * - Paintball and Chill's flier says 2025; kept as printed.
 */
export interface FlierEvent {
  title: string
  location: string
  dateLabel: string
  category: string
  imageUrl: string
}

export const fliers = {
  bloom: { title: 'The Bloom Experience', location: 'Fired & Iced, Lekki', dateLabel: '31 May 2026', category: 'Party', imageUrl: '/images/events/flier-bloom.jpg' },
  kindredPicnic: { title: 'Kindred Anniversary Picnic', location: 'Ikeja, Lagos', dateLabel: '12:00PM, 25 Apr 2026', category: 'Food & Drinks', imageUrl: '/images/events/flier-kindred-picnic.jpg' },
  earringSip: { title: 'Earring Making & Sip', location: 'Akoka, Yaba', dateLabel: '4:00PM, 18 Apr 2026', category: 'Wellness', imageUrl: '/images/events/flier-earring-sip.jpg' },
  paintSip: { title: 'Paint & Sip', location: 'Lagos', dateLabel: '12:00PM, 18 Apr 2026', category: 'Wellness', imageUrl: '/images/events/flier-paint-sip.jpg' },
  beachCamping: { title: 'Overnight Beach Camping', location: 'Sunset Haven, Tarkwa Bay', dateLabel: '25 Apr 2026', category: 'Travels & Exploration', imageUrl: '/images/events/flier-beach-camping.jpg' },
  movieNight: { title: 'Marathon Movie Night 5.0', location: 'Ikeja, Lagos', dateLabel: '10:00PM, 18 Apr 2026', category: 'Games', imageUrl: '/images/events/flier-movie-night.jpg' },
  exploreObudu: { title: 'Explore Obudu', location: 'Obudu, Cross River', dateLabel: '23 - 27 Apr 2026', category: 'Travels & Exploration', imageUrl: '/images/events/flier-explore-obudu.jpg' },
  lalaleFridayPhoto: { title: 'Lalale Friday', location: 'SixtyByCheflu, Yaba', dateLabel: '7:00PM, 10 Apr 2026', category: 'Party', imageUrl: '/images/events/flier-lalale-friday-photo.jpg' },
  lalaleFriday: { title: 'Lalale Friday', location: 'SixtyByCheflu, Yaba', dateLabel: '7:00PM, 24 Apr 2026', category: 'Party', imageUrl: '/images/events/flier-lalale-friday.jpg' },
  boredGames: { title: 'Bored Games Club', location: 'The Seasons 21, Lekki', dateLabel: '4:00PM, 25 Apr 2026', category: 'Games', imageUrl: '/images/events/flier-bored-games.jpg' },
  paintball: { title: 'Paintball and Chill', location: 'Magodo, Lagos', dateLabel: '12:00PM, 25 Apr 2025', category: 'Sports', imageUrl: '/images/events/flier-paintball.jpg' },
  owanbeElectro: { title: 'Owanbe Electro', location: 'Trib3, Victoria Island', dateLabel: '10:00PM, 9 May 2026', category: 'Party', imageUrl: '/images/events/flier-owanbe-electro.jpg' },
  reboot: { title: 'Reboot', location: 'Adrenaline Lounge, Akoka', dateLabel: '9:00PM, 8 May 2026', category: 'Party', imageUrl: '/images/events/flier-reboot.jpg' },
  mov3e: { title: 'MOV3E', location: 'Lagos', dateLabel: '9:00PM, 15 May 2026', category: 'Party', imageUrl: '/images/events/flier-mov3e.jpg' },
  sketchCafe: { title: 'Sketch Cafe', location: 'Dulce Cafe & Bakery, Lagos', dateLabel: '3:00PM, 16 May 2026', category: 'Food & Drinks', imageUrl: '/images/events/flier-sketch-cafe.jpg' },
  ultimateParty: { title: 'Ultimate Party Experience', location: 'Lekki Phase 1, Lagos', dateLabel: '6:00PM, 16 May 2026', category: 'Party', imageUrl: '/images/events/flier-ultimate-party.jpg' },
  sunRoom: { title: 'The Sun Room', location: 'Utako, Abuja', dateLabel: '4:00PM, 23 May 2026', category: 'Wellness', imageUrl: '/images/events/flier-sun-room.jpg' },
  faajiPent: { title: 'Faaji at the Pent', location: 'SixtyByCheflu, Yaba', dateLabel: '4:00PM, 23 May 2026', category: 'Party', imageUrl: '/images/events/flier-faaji-pent.jpg' },
  allWhite: { title: 'All White at the Balkony', location: 'Ilupeju, Lagos', dateLabel: '6:00PM, 23 May 2026', category: 'Party', imageUrl: '/images/events/flier-all-white.jpg' },
} satisfies Record<string, FlierEvent>
