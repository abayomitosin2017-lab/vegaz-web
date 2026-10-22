# Buy ticket flow: test cases

Covers the event page, the buy ticket flow (`components/checkout/`) and how
owning a ticket changes the event page and the chat. Each case was run in a
real browser (Chromium) on desktop (1440), tablet (800) and phone (393).
Demo rules: `johnbade@gmail.com` is an existing account (signs in as Esther
Marie, who already holds tickets for Ultimate Party Experience and Faaji at
the Pent); any other email is new. Payment is a demo step. A page reload
signs out and forgets purchases.

## A. Starting
| ID | Case | Expected |
|----|------|----------|
| A1 | Nothing picked | Buy Ticket disabled (desktop); no bottom bar (phone/tablet) |
| A2 | Pick tickets, signed out, Buy Ticket | "Buy Ticket" contact step |
| A3 | Pick tickets, signed in, Buy Ticket | Ticket Cart straight away, with the picks and the right total |
| A4 | Escape / X on any step | Closes; the picks stay on the page |

## B. Contact (signed out)
| ID | Case | Expected |
|----|------|----------|
| B1 | Empty, bad email ("lucy@"), or short phone | Proceed inactive |
| B2 | New email + phone, Proceed | "Give us more details", phone filled in |
| B3 | johnbade@gmail.com, Proceed | Goes straight to the cart (has an account) |

## C. Give us more details
| ID | Case | Expected |
|----|------|----------|
| C1 | Missing first name, last name or gender | Continue inactive |
| C2 | Back | Contact step with the email and phone still filled |
| C3 | Labels | "First Name", "Last Name" (not "First Name" twice) |
| C4 | All filled, Continue | Ticket Cart |

## D. Ticket Cart
| ID | Case | Expected |
|----|------|----------|
| D1 | + / − on a line | Total updates; the page's ticket cards show the same numbers |
| D2 | A line down to 0 | Line stays; total drops; all at 0 makes Checkout inactive |
| D3 | Limited tier ("3 tickets left") | + stops at the limit |
| D4 | Every type already in the cart | "+ Add New Ticket" hidden |
| D5 | Back: signed in / existing email / new email | Closes / contact / details |
| D6 | Total | Real sum of price × quantity |

## E. Add Ticket
| ID | Case | Expected |
|----|------|----------|
| E1 | Open the list | Only types not in the cart; sold out greyed with "Sold out" and cannot be picked; low stock shows "N tickets left" |
| E2 | Nothing chosen | Add to cart inactive |
| E3 | Choose a type, Add to cart | Back in the cart with that type at 1; page card shows 1 |
| E4 | Back | Ticket Cart |
| E5 | Keyboard | Down opens, Up/Down move, Enter picks, Escape closes the list (not the dialog) |

## F. Assign tickets
| ID | Case | Expected |
|----|------|----------|
| F1 | First purchase | Buyer already holds ticket 1: "<type> · You · Ticket buyer"; "1 of N assigned" |
| F2 | Not all assigned | Proceed grey and inactive |
| F3 | Add user: missing name / bad email / no tier | Proceed inactive |
| F4 | Tier list | Only tiers with tickets left to assign |
| F5 | Add everyone | "N of N assigned", "0 remaining", "+ Assign Ticket" hidden, Proceed active |
| F6 | Edit a person | "Edit user" with their details; changes saved |
| F7 | More than 3 people | List scrolls; "Scroll to see all N assignees" |
| F8 | Back to cart, lower a quantity, Checkout again | Extra assignments for that type are dropped |
| F9 | Buying more when you already hold a ticket | No automatic "You · Ticket buyer" row; every new ticket is assigned |

## G. Payment
| ID | Case | Expected |
|----|------|----------|
| G1 | Paid tickets | "Pay with Paystack" with the right count and total; "Pay ₦X" |
| G2 | Back | Assign tickets, assignments kept |
| G3 | Only free tickets (₦0) | No payment step; straight to success |

## H. Success
| ID | Case | Expected |
|----|------|----------|
| H1 | After paying | "Your ticket is on its way..."; the buyer is logged in (header shows them) |
| H2 | Join Chat with Others (from the event page) | Event chat opens; its header shows **Share Event**, not Buy Ticket |
| H3 | Close / Cancel | Picks cleared; the page shows **Share Event** under the tickets; tickets can still be bought |
| H4 | Back on the event page after joining the chat | Title button reads **Open Chat** and opens the chat; phone "Not ready to buy a ticket?" card hidden |

## I. Owning a ticket
| ID | Case | Expected |
|----|------|----------|
| I1 | Esther (demo account) opens Ultimate Party / Faaji chats | Share Event (she holds tickets) |
| I2 | Esther opens a chat for an event she has no ticket for | Buy Ticket |
| I3 | Guest assigned a ticket logs in with that email (new account) | Event page shows Share Event |
| I4 | Someone who only joined the chat (no ticket) | Chat shows Buy Ticket; event page shows Open Chat, no Share Event |

## J. Buy Ticket inside a chat
| ID | Case | Expected |
|----|------|----------|
| J1 | Buy Ticket in a chat with no ticket | Buy flow opens at **Add Ticket**, empty cart |
| J2 | Back on Add Ticket | Empty Ticket Cart, Checkout inactive; Back again closes |
| J3 | Complete a purchase | Chat header switches to Share Event; Join Chat with Others closes the flow, chat stays open |

## K. Layout and access
| ID | Case | Expected |
|----|------|----------|
| K1 | Desktop/tablet | 393px dialog; success 479px purple card |
| K2 | Phone | Bottom sheet; success full screen |
| K3 | Every step, every size | No sideways page scroll; nothing cut off |
| K4 | Focus | Moves into each new step; returns after closing |

## Last run (22 Oct)
321 checks, all passing: every case above at 1440, 800 and 393px (K checks
on every step). The earlier suites (event page, gallery, chat, onboarding,
header) were re-run and still pass.
Bugs this round of testing found and fixed:
- Chat kept showing "Buy Ticket" after buying: ticket ownership was fixed
  demo data. It now comes from the tickets each email holds.
- Chat "Buy Ticket" did nothing: it now opens the flow at Add Ticket.
- A dialog created already open (the flow opened from a chat) did not move
  focus into itself or stop the page scrolling (UiModal).
