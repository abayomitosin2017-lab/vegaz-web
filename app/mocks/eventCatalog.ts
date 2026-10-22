import type { EventDetails, EventExpectation, EventMember } from '~/types/event'
import type { TicketType } from '~/types/ticket'
import { people, type PersonKey } from './people'
import { placeholderSquare } from './placeholders'

/**
 * Every demo event, built from the fliers supplied by design (22 Oct).
 * One place for an event's card, details page, tickets and chat link.
 * Mock data only: components never import this file (use services/).
 *
 * From the fliers: title, place, date, ticket names and prices.
 * Written for the demo (FLAG, not real): "About" text, host, community,
 * extra gallery photos (placeholder portraits after the flier, decision
 * 22 Oct), categories, and the Figma ticket tiers for fliers that list none.
 * "What to expect" uses the Figma rows and photos for every event.
 * Dates without a time on the flier use 12:00PM.
 */

/** Figma "What to expect" rows (event details), same for every demo event */
const expectations: EventExpectation[] = [
  { title: 'Loads of fun', description: 'A delightful experience that brings joy and laughter.', imageUrl: '/images/expect/expect-fun.png' },
  { title: 'Games and activities', description: 'Explore a world of fun with our exciting games and engaging activities designed for everyone!', imageUrl: '/images/expect/expect-games.png' },
  { title: 'Networking', description: 'Connect with like-minded people and expand your opportunities through effective networking.', imageUrl: '/images/expect/expect-networking.png' },
  { title: 'Dance! Dance! Dance!', description: 'Groove to the rhythm and let your spirit soar with every beat.', imageUrl: '/images/expect/expect-dance.png' },
]

/** Figma ticket tiers (Component 13), used when a flier lists no prices */
const figmaTiers: TicketType[] = [
  { id: 'free', name: 'FREE TICKET', priceLabel: 'Free', price: 0, description: 'General Admission', availability: 'available' },
  { id: 'table2', name: 'TABLE FOR 2', priceLabel: '₦10,000', price: 10000, description: 'Two long table, close to Dj’s deck', availability: 'available' },
  { id: 'vip', name: 'VIP TABLE', priceLabel: '₦100,000', price: 100000, description: 'Front row long table, close to Dj’s deck, snacks, free drinks, small chops and a dedicated host for the night', availability: 'available' },
]

const naira = (n: number) => (n === 0 ? 'Free' : `₦${n.toLocaleString('en-NG')}`)
const tier = (id: string, name: string, price: number, description: string, extra: Partial<TicketType> = {}): TicketType =>
  ({ id, name, price, priceLabel: naira(price), description, availability: 'available', ...extra })

/** Community row: host first, then up to 4 others */
const members = (host: PersonKey, ...others: PersonKey[]): EventMember[] => [
  { person: people[host], gender: people[host].gender, isHost: true },
  ...others.map(k => ({ person: people[k], gender: people[k].gender })),
]
/** Flier first, then `extra` placeholder photos (shows the gallery layouts) */
const gallery = (flier: string, ...extra: number[]) => [flier, ...extra.map(placeholderSquare)]

interface CatalogEntry {
  event: EventDetails
  tickets: TicketType[]
}

const entry = (
  e: Omit<EventDetails, 'expectations' | 'members' | 'host' | 'imageUrl' | 'photos'> & {
    flier: string
    extraPhotos?: number[]
    host: PersonKey
    others: PersonKey[]
  },
  tickets: TicketType[] = figmaTiers,
): CatalogEntry => {
  const { flier, extraPhotos = [], host, others, ...rest } = e
  return {
    event: {
      ...rest,
      imageUrl: flier,
      photos: gallery(flier, ...extraPhotos),
      host: people[host],
      members: members(host, ...others),
      expectations,
    },
    tickets,
  }
}

export const catalog: CatalogEntry[] = [
  entry({
    id: 'bloom-experience', title: 'The Bloom Experience', category: 'Party', flier: '/images/events/flier-bloom.jpg', extraPhotos: [5, 14, 21, 2, 6],
    location: 'Fired & Iced, Lekki', address: 'Fired & Iced, Admiralty Way, Lekki, Lagos',
    startsAt: '2026-05-31T12:00:00+01:00', dateLabel: '31 May 2026',
    host: 'vivian', others: ['ada', 'kemi', 'dayo', 'sandra'], communityCount: 86,
    about: 'A Sunday of live music in full bloom. Shime Ahua performs live: come early, bring your friends and your best yellow.',
  }),
  entry({
    id: 'kindred-anniversary-picnic', title: 'Kindred Anniversary Picnic', category: 'Food & Drinks', flier: '/images/events/flier-kindred-picnic.jpg',
    location: 'Ikeja, Lagos', address: 'Ikeja, Lagos', chatId: 'picnic-legacy',
    startsAt: '2026-04-25T12:00:00+01:00', dateLabel: '12:00PM, 25 Apr 2026',
    host: 'janet', others: ['john', 'bisi', 'amaka', 'femi'], communityCount: 48,
    about: 'We’re celebrating our very first year of community! Join us for a chill picnic and bring a dish to share. Come hungry: good food, laughter and games.',
  }, [tier('ticket', 'PICNIC TICKET', 4000, 'Bring a dish to share')]),
  entry({
    id: 'earring-making-sip', title: 'Earring Making & Sip', category: 'Wellness', flier: '/images/events/flier-earring-sip.jpg', extraPhotos: [16],
    location: 'Akoka, Yaba', address: 'Akoka, Yaba, Lagos',
    startsAt: '2026-04-18T16:00:00+01:00', dateLabel: '4:00PM, 18 Apr 2026',
    host: 'ifeoma', others: ['kemi', 'bisi', 'ada'], communityCount: 18,
    about: 'Make your own beaded earrings while you sip and meet new people. The fee covers materials and supplies, drinks, games and networking.',
  }, [tier('seat', 'WORKSHOP SEAT', 15000, 'Materials & supplies, drinks, games & networking', { availability: 'low', availabilityLabel: '4 tickets left', maxQuantity: 4 })]),
  entry({
    id: 'paint-and-sip', title: 'Paint & Sip', category: 'Wellness', flier: '/images/events/flier-paint-sip.jpg', extraPhotos: [24, 10],
    location: 'Lagos', address: 'Lagos',
    startsAt: '2026-04-18T12:00:00+01:00', dateLabel: '12:00PM, 18 Apr 2026',
    host: 'amaka', others: ['uche', 'sandra', 'segun', 'janet'], communityCount: 32,
    about: 'Time out with nature: paint, sip and unwind outdoors. Karaoke, card games, networking and Q&A sessions, and many more.',
  }, [tier('ticket', 'PAINT & SIP', 10000, 'Painting kit, drinks, karaoke and games')]),
  entry({
    id: 'overnight-beach-camping', title: 'Overnight Beach Camping', category: 'Travels & Exploration', flier: '/images/events/flier-beach-camping.jpg', extraPhotos: [13, 3, 19, 8, 12],
    location: 'Sunset Haven, Tarkwa Bay', address: 'Sunset Haven, Tarkwa Bay, Lagos', chatId: 'swimming',
    startsAt: '2026-04-25T12:00:00+01:00', dateLabel: '25 Apr 2026',
    host: 'sandra', others: ['tobi', 'vivian', 'chidi', 'bayo'], communityCount: 64,
    about: 'Spend a night by the ocean: tent, duvet and pillow, beach access, boat ride, volleyball, music and dance, games night and a chill zone.',
  }, [
    tier('shared', 'SHARED TENT', 23000, 'Shared tent, without mat'),
    tier('shared-mat', 'SHARED TENT + MAT', 25000, 'Shared tent, with mat'),
    tier('private', 'PRIVATE TENT', 27000, 'Private tent, without mat', { availability: 'low', availabilityLabel: '3 tickets left', maxQuantity: 3 }),
    tier('private-mat', 'PRIVATE TENT + MAT', 29000, 'Private tent, with mat', { availability: 'sold-out', availabilityLabel: 'Sold out' }),
  ]),
  entry({
    id: 'marathon-movie-night', title: 'Marathon Movie Night 5.0', category: 'Games', flier: '/images/events/flier-movie-night.jpg',
    location: 'Ikeja, Lagos', address: 'Ikeja, Lagos',
    startsAt: '2026-04-18T22:00:00+01:00', dateLabel: '10:00PM, 18 Apr 2026',
    host: 'femi', others: ['john', 'kemi', 'uche', 'ada'], communityCount: 40,
    about: 'Relax, unwind and enjoy three blockbuster films with friends and family. Popcorn and drinks included.',
  }, [tier('ticket', 'MOVIE NIGHT', 15000, '3 blockbuster movies with popcorn & drinks')]),
  entry({
    id: 'explore-obudu', title: 'Explore Obudu', category: 'Travels & Exploration', flier: '/images/events/flier-explore-obudu.jpg', extraPhotos: [13, 22, 3, 9],
    location: 'Obudu, Cross River', address: 'Obudu Mountain Resort, Cross River',
    startsAt: '2026-04-23T12:00:00+01:00', dateLabel: '23 - 27 Apr 2026',
    host: 'dayo', others: ['ifeoma', 'segun', 'janet', 'oreban'], communityCount: 22,
    about: 'Five days and four nights at Obudu: road trip, feeding, nice accommodation, vibes and networking. Flight from Lagos available.',
  }, [
    tier('road', 'ROAD TRIP', 500000, '5 days, 4 nights by road from Lagos'),
    tier('flight', 'FLIGHT FROM LAGOS', 700000, '5 days, 4 nights, return flight included'),
  ]),
  entry({
    id: 'lalale-friday-10-apr', title: 'Lalale Friday', category: 'Party', flier: '/images/events/flier-lalale-friday-photo.jpg', extraPhotos: [6, 15, 4],
    location: 'SixtyByCheflu, Yaba', address: '270 Herbert Macaulay Way, Yaba, Lagos',
    startsAt: '2026-04-10T19:00:00+01:00', dateLabel: '7:00PM, 10 Apr 2026',
    host: 'tobi', others: ['vivian', 'amaka', 'chidi', 'bisi'], communityCount: 120,
    about: 'Karaoke, games and an after party. Good vibes, community and good people. RSVP with a donation.',
  }, [tier('rsvp', 'RSVP', 0, 'RSVP with donation')]),
  entry({
    id: 'lalale-friday-24-apr', title: 'Lalale Friday', category: 'Party', flier: '/images/events/flier-lalale-friday.jpg',
    location: 'SixtyByCheflu, Yaba', address: '270 Herbert Macaulay Way, Yaba, Lagos', chatId: 'slides-shots',
    startsAt: '2026-04-24T19:00:00+01:00', dateLabel: '7:00PM, 24 Apr 2026',
    host: 'vivian', others: ['tobi', 'ada', 'segun', 'kemi'], communityCount: 2600,
    about: 'WYD after work? Karaoke, games night and an after party from 7PM to 1AM. Come ready to sing, play and party.',
  }, [tier('rsvp', 'RSVP', 0, 'RSVP with donation')]),
  entry({
    id: 'bored-games-club', title: 'Bored Games Club', category: 'Games', flier: '/images/events/flier-bored-games.jpg', extraPhotos: [17],
    location: 'The Seasons 21, Lekki', address: 'The Seasons 21 Apartments, Lekki, Lagos',
    startsAt: '2026-04-25T16:00:00+01:00', dateLabel: '4:00PM, 25 Apr 2026',
    host: 'chidi', others: ['bayo', 'ifeoma', 'sam', 'janet'], communityCount: 36,
    about: 'An afternoon of board games, card games and puzzles from 4PM to 10PM. ₦15,000 at the door.',
  }, [tier('online', 'ONLINE TICKET', 11000, 'Online price (₦15,000 at the door)')]),
  entry({
    id: 'paintball-and-chill', title: 'Paintball and Chill', category: 'Sports', flier: '/images/events/flier-paintball.jpg', extraPhotos: [20, 12, 9, 17, 4],
    location: 'Magodo, Lagos', address: 'Magodo, Lagos',
    startsAt: '2025-04-25T12:00:00+01:00', dateLabel: '12:00PM, 25 Apr 2025',
    host: 'uche', others: ['femi', 'dayo', 'kemi', 'sandra'], communityCount: 54,
    about: 'Paintball, paintball gear, squid game, board games, and food and drinks. Bring your squad.',
  }, [
    tier('single', 'SINGLE', 30000, 'Paintball, gear, games, food & drinks'),
    tier('couple', 'COUPLE', 56000, 'For two: paintball, gear, games, food & drinks'),
  ]),
  entry({
    id: 'owanbe-electro', title: 'Owanbe Electro', category: 'Party', flier: '/images/events/flier-owanbe-electro.jpg',
    location: 'Trib3, Victoria Island', address: '288B Ajose Adeogun Street, Victoria Island, Lagos',
    startsAt: '2026-05-09T22:00:00+01:00', dateLabel: '10:00PM, 9 May 2026',
    host: 'oreban', others: ['vivian', 'bayo', 'amaka', 'tobi'], communityCount: 300,
    about: 'Owanbe meets electronic music, 10PM till dawn. Dress up and dance all night.',
  }),
  entry({
    id: 'reboot', title: 'Reboot', category: 'Party', flier: '/images/events/flier-reboot.jpg', extraPhotos: [12, 20],
    location: 'Adrenaline Lounge, Akoka', address: 'Adrenaline Lounge, Akoka, Lagos', chatId: 'house-party-2',
    startsAt: '2026-05-08T21:00:00+01:00', dateLabel: '9:00PM, 8 May 2026',
    host: 'sam', others: ['segun', 'chidi', 'ada', 'bisi'], communityCount: 60,
    about: 'A rave experience for freshers and returning students, 9PM till dawn.',
  }, [
    tier('energy', 'ENERGY PASS', 2000, 'Entry for one'),
    tier('voltage', 'VOLTAGE TABLE (5)', 20000, 'A table for five'),
  ]),
  entry({
    id: 'mov3e', title: 'MOV3E', category: 'Party', flier: '/images/events/flier-mov3e.jpg',
    location: 'Lagos', address: 'Location shared closer to the date',
    startsAt: '2026-05-15T21:00:00+01:00', dateLabel: '9:00PM, 15 May 2026',
    host: 'dayo', others: ['uche', 'kemi', 'tobi', 'janet'], communityCount: 75,
    about: 'Music policy: 3 step, afrohouse, afrotech, gqom and deep house. Coordinates incoming. Find your signal.',
  }),
  entry({
    id: 'sketch-cafe', title: 'Sketch Cafe', category: 'Food & Drinks', flier: '/images/events/flier-sketch-cafe.jpg', extraPhotos: [23],
    location: 'Dulce Cafe & Bakery, Lagos', address: 'Dulce Cafe & Bakery, Lagos',
    startsAt: '2026-05-16T15:00:00+01:00', dateLabel: '3:00PM, 16 May 2026',
    host: 'bisi', others: ['ifeoma', 'amaka', 'femi'], communityCount: 20,
    about: 'Draw it out: an afternoon of sketching, coffee and pastries, 3PM to 6PM.',
  }),
  entry({
    id: 'ultimate-party-experience', title: 'Ultimate Party Experience', category: 'Party', flier: '/images/events/flier-ultimate-party.jpg', extraPhotos: [10, 6, 11, 1, 5],
    location: 'Lekki Phase 1, Lagos', address: 'Dorée Apartment, Lekki Phase 1, Lagos', chatId: 'house-party',
    startsAt: '2026-05-16T18:00:00+01:00', dateLabel: '6:00PM, 16 May 2026',
    host: 'oreban', others: ['janet', 'vivian', 'tobi', 'sandra'], communityCount: 100,
    about: 'A house party and a boat cruise in one night. Starts at 6PM at Dorée Apartment.',
  }, [
    tier('guys', 'GUYS', 70000, 'House party + boat cruise'),
    tier('ladies', 'LADIES', 50000, 'House party + boat cruise'),
  ]),
  entry({
    id: 'the-sun-room', title: 'The Sun Room', category: 'Wellness', flier: '/images/events/flier-sun-room.jpg',
    location: 'Utako, Abuja', address: 'Plot 155, Akinwale Wey Close, off Okotie Eboh Road, Utako, Abuja',
    startsAt: '2026-05-23T16:00:00+01:00', dateLabel: '4:00PM, 23 May 2026',
    host: 'ifeoma', others: ['bisi', 'kemi', 'amaka', 'janet'], communityCount: 30,
    about: 'An afternoon of poetry, music and wellness.',
  }),
  entry({
    id: 'faaji-at-the-pent', title: 'Faaji at the Pent', category: 'Party', flier: '/images/events/flier-faaji-pent.jpg', extraPhotos: [4, 19, 22],
    location: 'SixtyByCheflu, Yaba', address: '270 Herbert Macaulay Way, Yaba, Lagos', chatId: 'ikorodu-block',
    startsAt: '2026-05-23T16:00:00+01:00', dateLabel: '4:00PM, 23 May 2026',
    host: 'tobi', others: ['oreban', 'ada', 'femi', 'vivian'], communityCount: 230,
    about: 'Games, performances and a rave on the rooftop.',
  }, [
    tier('early', 'EARLY BIRD', 10000, 'Early bird price', { availability: 'low', availabilityLabel: '5 tickets left', maxQuantity: 5 }),
    tier('gate', 'AT THE GATE', 15000, 'Pay at the gate', { availability: 'sold-out', availabilityLabel: 'Pay at gate' }),
  ]),
  entry({
    id: 'all-white-at-the-balkony', title: 'All White at the Balkony', category: 'Party', flier: '/images/events/flier-all-white.jpg', extraPhotos: [1, 8, 15, 21, 11],
    location: 'Ilupeju, Lagos', address: 'Daltior, 18 Association Avenue, Ilupeju, Lagos', chatId: 'phelinas',
    startsAt: '2026-05-23T18:00:00+01:00', dateLabel: '6:00PM, 23 May 2026',
    host: 'ada', others: ['sandra', 'bayo', 'vivian', 'dayo'], communityCount: 35,
    about: 'All white everything at The Balkony, 6PM till late. Wear white, bring your energy.',
  }),
]

export const eventById = Object.fromEntries(catalog.map(c => [c.event.id, c]))
