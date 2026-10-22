import type { TicketType } from '~/types/ticket'

/**
 * Mock ticket types copied from Figma Component 13 (node 9832:32993), one per
 * variant. The VIP description is written in full; the card cuts it to 2 lines.
 */
export const ticketTypesMock: TicketType[] = [
  { id: 't-free', name: 'FREE TICKET', priceLabel: 'Free', price: 0, description: 'General Admission', availability: 'available' },
  { id: 't-table2', name: 'TABLE FOR 2', priceLabel: '₦10,000', price: 10000, description: 'Two long table, close to Dj’s deck', availability: 'available' },
  { id: 't-vip', name: 'VIP TABLE', priceLabel: '₦100,000', price: 100000, description: 'Front row long table, close to Dj’s deck, snacks, free drinks, small chops and a dedicated host for the night', availability: 'available' },
  { id: 't-vip-low', name: 'VIP TABLE', priceLabel: '₦100,000', price: 100000, description: 'Front row long table, close to Dj’s deck, snacks, free drinks, small chops and a dedicated host for the night', availability: 'low', availabilityLabel: '5 ticket left', maxQuantity: 5 },
  { id: 't-vip-sold', name: 'VIP TABLE', priceLabel: '₦100,000', price: 100000, description: 'Front row long table, close to Dj’s deck, snacks, free drinks, small chops and a dedicated host for the night', availability: 'sold-out', availabilityLabel: 'Sold out' },
]

/** Starting quantities shown in Figma (5, 2, 5, 5, -) */
export const ticketQuantitiesMock: Record<string, number> = {
  't-free': 5, 't-table2': 2, 't-vip': 5, 't-vip-low': 5, 't-vip-sold': 0,
}
