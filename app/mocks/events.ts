import type { EventSummary, HomeEvents } from '~/types/event'
import { eventById } from './eventCatalog'

/**
 * Home page events (layout from Figma "Desktop - 29", node 9856:49029).
 * Decision 22 Oct: the events come from the fliers supplied by design (see
 * eventCatalog.ts), replacing the Figma demo text. Some events appear in more
 * than one section. Replace with the real API in services/events.ts.
 * Do not import this file from components.
 */
const pick = (...ids: string[]): EventSummary[] =>
  ids.map((id) => {
    const { title, location, dateLabel, category, imageUrl } = eventById[id]!.event
    return { id, title, location, dateLabel, category, imageUrl }
  })

export const homeEventsMock: HomeEvents = {
  happeningThisWeek: pick('lalale-friday-10-apr', 'bored-games-club', 'paintball-and-chill', 'explore-obudu', 'the-sun-room'),
  hotRightNow: pick('owanbe-electro', 'kindred-anniversary-picnic', 'mov3e', 'paint-and-sip', 'faaji-at-the-pent', 'sketch-cafe'),
  upcoming: pick('overnight-beach-camping', 'marathon-movie-night', 'reboot', 'earring-making-sip', 'lalale-friday-24-apr', 'bloom-experience'),
  exploreAll: pick('all-white-at-the-balkony', 'ultimate-party-experience', 'the-sun-room', 'paintball-and-chill', 'bored-games-club'),
}
