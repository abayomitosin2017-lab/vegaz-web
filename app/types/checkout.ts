/**
 * Buy ticket flow (Figma section "event details", 10713:56670).
 * Field names are a proposal for the API contract; engineering to confirm.
 */
import type { Gender } from './auth'

/** Step 1: how we reach the buyer */
export interface CheckoutContact {
  email: string
  phone: string
}

/** Step 2 (no Vegaz account yet): "Give us more details" */
export interface BuyerDetails {
  firstName: string
  lastName: string
  phone: string
  gender: Gender
}

/** Who each ticket is for ("Assign tickets") */
export interface TicketAssignee {
  id: string
  fullName: string
  email: string
  phone?: string
  /** Ticket type id */
  ticketId: string
  /** The person paying ("You · Ticket buyer") */
  isBuyer?: boolean
}

export interface CheckoutOrder {
  eventId: string
  buyer: CheckoutContact & { firstName: string; lastName: string; gender?: Gender; hasAccount: boolean }
  /** Ticket type id -> how many */
  quantities: Record<string, number>
  assignees: TicketAssignee[]
  total: number
}
