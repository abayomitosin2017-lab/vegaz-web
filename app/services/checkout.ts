import type { CheckoutOrder } from '~/types/checkout'
import type { SessionUser } from '~/types/auth'
import { mockExistingAccount, mockExistingEmails, mockLatencyMs } from '~/mocks/auth'
import { recordTickets, ticketsHeld } from './tickets'
import { mockRequest } from './mockRequest'

/**
 * Buy ticket service (MOCK). Components call only these functions; replace
 * the bodies with real API calls and keep the signatures.
 *
 * OPEN ITEMS (engineering):
 * - Account lookup by email (the demo reuses the login rule: only
 *   johnbade@gmail.com has an account).
 * - Creating the order, holding tickets while the buyer pays, and what
 *   happens when a tier sells out mid-checkout.
 * - Paystack: start the real Paystack checkout with the order total and
 *   confirm the payment on the server (webhook) before issuing tickets.
 * - Emailing tickets to the buyer and every assignee.
 * - Signing the buyer in after paying (decision 22 Oct: they end up logged in).
 */
const wait = (ms = mockLatencyMs) => mockRequest(ms)

/** Does this email already belong to a Vegaz account? (and whose, to label the buyer's ticket) */
export async function findAccount(email: string): Promise<{ exists: boolean; firstName?: string; lastName?: string }> {
  await wait()
  const exists = mockExistingEmails.includes(email.trim().toLowerCase())
  return exists ? { exists, firstName: mockExistingAccount.firstName, lastName: mockExistingAccount.lastName } : { exists }
}

/** Saves the order before payment; returns its reference. */
export async function createOrder(order: CheckoutOrder): Promise<{ orderId: string }> {
  await wait()
  return { orderId: `VGZ-${order.eventId.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}` }
}

/** MOCK Paystack: always succeeds. Real flow: open Paystack, confirm on the server. */
export async function payOrder(_orderId: string, _amount: number): Promise<{ paid: boolean }> {
  await wait(700)
  return { paid: true }
}

/**
 * Issues the tickets once the order is paid (or free): every ticket goes to
 * the person it was assigned to (decision 22 Oct: assigned guests count as
 * ticket holders when they log in with that email).
 */
export async function issueTickets(orderId: string, order: CheckoutOrder): Promise<void> {
  await wait(150)
  recordTickets(order.assignees.map(a => ({ email: a.email, eventId: order.eventId, ticketId: a.ticketId, orderId })))
}

/** Does this email already hold a ticket for the event? (then the buyer is not added again) */
export async function holdsTicket(email: string, eventId: string): Promise<boolean> {
  return ticketsHeld(email, eventId) > 0
}

/**
 * After a successful order the buyer is signed in (decision 22 Oct):
 * an existing account signs in; a new buyer gets an account from the
 * details they gave.
 */
export async function signInBuyer(order: CheckoutOrder): Promise<SessionUser> {
  await wait(150)
  const { buyer } = order
  if (buyer.hasAccount && mockExistingEmails.includes(buyer.email.trim().toLowerCase())) {
    return { ...mockExistingAccount, email: buyer.email, phone: buyer.phone || mockExistingAccount.phone }
  }
  const base = `${buyer.firstName}${buyer.lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '') || 'guest'
  return { firstName: buyer.firstName, lastName: buyer.lastName, username: base, email: buyer.email, phone: buyer.phone }
}
