/**
 * Demo numbers for Activities rows. Mock data only: components never import
 * this file (use services/profile.ts).
 * FLAG (not real): the catalog has no gender split or capacity per event, so
 * these are invented for the demo. The API should send them.
 */
export const mockActivityStats: Record<string, { female: number; male: number; slotsLeft: number | null }> = {
  'ultimate-party-experience': { female: 8, male: 5, slotsLeft: 5 },
  'faaji-at-the-pent': { female: 12, male: 9, slotsLeft: 14 },
  'kindred-anniversary-picnic': { female: 28, male: 20, slotsLeft: 12 },
  'overnight-beach-camping': { female: 10, male: 14, slotsLeft: 6 },
  'bloom-experience': { female: 51, male: 35, slotsLeft: 40 },
}

/** Delay of the mock calls */
export const mockProfileLatencyMs = 250
