/**
 * Tickets people already hold (demo). Mock data only: components never
 * import this file (use services/tickets.ts).
 * The demo account (johnbade@gmail.com, signs in as Esther Marie) holds
 * tickets for Ultimate Party Experience and Faaji at the Pent, so those two
 * chats show "Share Event" instead of "Buy Ticket" (Figma chat frames).
 * Tickets bought in the preview are added at runtime (memory only: a
 * reload resets them, decision 22 Oct).
 */
export interface OwnedTicketRecord {
  /** Holder's email: the buyer or a guest the buyer assigned */
  email: string
  eventId: string
  ticketId: string
  orderId: string
}

export const mockOwnedTickets: OwnedTicketRecord[] = [
  { email: 'johnbade@gmail.com', eventId: 'ultimate-party-experience', ticketId: 'guys', orderId: 'VGZ-DEMO-1' },
  { email: 'johnbade@gmail.com', eventId: 'faaji-at-the-pent', ticketId: 'early', orderId: 'VGZ-DEMO-2' },
]
