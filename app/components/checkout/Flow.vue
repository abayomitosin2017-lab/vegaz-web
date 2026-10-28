<script setup lang="ts">
/**
 * CheckoutFlow: the buy ticket flow on the event page (Figma section
 * "event details", 10713:56670). A 393px dialog on desktop and tablet, a
 * bottom sheet on phones; the success screen is a purple dialog on desktop
 * and full screen on phones.
 *
 * Steps (decisions 22 Oct):
 *   signed out:  Buy Ticket (contact) -> [Give us more details, only when
 *                the email has no account] -> Ticket Cart
 *   signed in:   Ticket Cart straight away
 *   from a chat's "Buy Ticket": Add Ticket with an empty cart; its Back goes
 *   to the (empty) cart
 *   Ticket Cart <-> Add Ticket
 *   Checkout -> Assign tickets <-> Add user / Edit user. The buyer gets the
 *   first ticket unless they already hold one for this event (buying more
 *   for others, decision 22 Oct).
 *   Proceed (assigning optional; leftovers go to the buyer, decision 27 Oct) -> Pay (mock Paystack; skipped when the
 *   total is ₦0) -> success, and the buyer is signed in.
 *   "Join Chat with Others" opens the event chat (the page handles it).
 *   "Close" / X on the success screen (decision 27 Oct): closes only the
 *   success screen and puts the buyer in the event's community, so the
 *   event page shows them as in the chat ("Open Chat").
 *
 * Quantities are shared with the page (v-model), so the cart and the
 * ticket cards always match. Closing keeps what was typed until the page
 * is left. After a purchase, closing clears the picks.
 * Only demo data: see services/checkout.ts for what engineering replaces.
 */
import './styles.css'
import type { EventDetails } from '~/types/event'
import type { TicketType } from '~/types/ticket'
import type { BuyerDetails, CheckoutContact, CheckoutOrder, TicketAssignee } from '~/types/checkout'
import type { SelectOption } from './Select.vue'
import { createOrder, findAccount, holdsTicket, issueTickets, payOrder, signInBuyer } from '~/services/checkout'
import { joinEventChat } from '~/services/chat'

type Step = 'contact' | 'details' | 'cart' | 'add' | 'assign' | 'assignee' | 'pay' | 'success'

const props = withDefaults(
  defineProps<{
    open: boolean
    event: EventDetails
    tickets: TicketType[]
    /** 'add': start on Add Ticket with an empty cart (chat "Buy Ticket", decision 22 Oct) */
    start?: 'cart' | 'add'
    /**
     * Phones: the Buy Ticket sheet already was the cart (decision 28 Oct), so
     * the flow skips Ticket Cart: signed out -> email (and details) -> Assign
     * tickets; signed in -> Assign tickets. Back from Assign tickets goes to
     * the email step, or closes for signed-in buyers.
     */
    skipCart?: boolean
  }>(),
  { start: 'cart' },
)
const quantities = defineModel<Record<string, number>>('quantities', { required: true })
const emit = defineEmits<{ close: []; purchased: []; 'join-chat': [] }>()

const { user, setUser } = useSession()
const titleId = useId()

const step = ref<Step>('cart')
const busy = ref(false)
const contact = ref<CheckoutContact>({ email: '', phone: '' })
const details = ref<Partial<BuyerDetails>>({})
const hasAccount = ref(false)
const accountName = ref<{ firstName: string; lastName: string } | null>(null)
const lines = ref<string[]>([])
const assignees = ref<TicketAssignee[]>([])
const editing = ref<string | null>(null)
const purchased = ref(false)

const count = computed(() => props.tickets.reduce((n, t) => n + (quantities.value[t.id] ?? 0), 0))
// Free-only order: RSVP wording, no payment step (decision 26 Oct)
const free = computed(() => count.value > 0 && total.value === 0)
const total = computed(() => props.tickets.reduce((sum, t) => sum + t.price * (quantities.value[t.id] ?? 0), 0))
const notInCart = computed(() => props.tickets.filter(t => !lines.value.includes(t.id)))

// ---- Opening ----
watch(() => props.open, (isOpen) => {
  if (!isOpen) return
  purchased.value = false
  editing.value = null
  if (props.start === 'add') quantities.value = Object.fromEntries(props.tickets.map(t => [t.id, 0]))
  lines.value = props.tickets.filter(t => (quantities.value[t.id] ?? 0) > 0).map(t => t.id)
  if (user.value) {
    hasAccount.value = true
    contact.value = { email: user.value.email ?? '', phone: user.value.phone ?? '' }
    accountName.value = { firstName: user.value.firstName, lastName: user.value.lastName }
    if (props.skipCart) startAssigning()
    else step.value = props.start === 'add' ? 'add' : 'cart'
  } else {
    step.value = 'contact'
  }
}, { immediate: true })

// ---- Contact / details ----
async function onContact(value: CheckoutContact) {
  busy.value = true
  try {
    contact.value = value
    const res = await findAccount(value.email)
    hasAccount.value = res.exists
    accountName.value = res.exists && res.firstName ? { firstName: res.firstName, lastName: res.lastName ?? '' } : null
    if (res.exists) afterContact()
    else {
      details.value = { ...details.value, phone: details.value.phone || value.phone }
      step.value = 'details'
    }
  } finally {
    busy.value = false
  }
}
function onDetails(value: BuyerDetails) {
  details.value = value
  afterContact()
}
/** After email (and details): the cart, or straight to Assign tickets (phone sheet) */
function afterContact() {
  if (props.skipCart) startAssigning()
  else step.value = 'cart'
}
function backFromAssign() {
  if (props.skipCart) backFromCart()
  else step.value = 'cart'
}
function backFromCart() {
  if (user.value) emit('close')
  else step.value = hasAccount.value ? 'contact' : 'details'
}

// ---- Cart ----
function addTicket(id: string) {
  if (!lines.value.includes(id)) lines.value.push(id)
  quantities.value = { ...quantities.value, [id]: Math.max(1, quantities.value[id] ?? 0) }
  step.value = 'cart'
}

// ---- Assigning ----
const buyerName = computed(() => {
  const n = accountName.value ?? (details.value.firstName ? { firstName: details.value.firstName, lastName: details.value.lastName ?? '' } : null)
  return n ? `${n.firstName} ${n.lastName}`.trim() : contact.value.email
})
const assignedFor = (ticketId: string, except?: string) => assignees.value.filter(a => a.ticketId === ticketId && a.id !== except).length
async function startAssigning() {
  // Keep earlier assignments that still fit the quantities. The buyer holds
  // one ticket, unless they already hold one for this event.
  const alreadyHolds = await holdsTicket(contact.value.email, props.event.id)
  const kept: TicketAssignee[] = []
  for (const a of assignees.value) {
    if (kept.filter(k => k.ticketId === a.ticketId).length < (quantities.value[a.ticketId] ?? 0)) kept.push(a)
  }
  const buyer = kept.find(a => a.isBuyer)
  const firstType = lines.value.find(id => (quantities.value[id] ?? 0) > 0)
  if (buyer) Object.assign(buyer, { fullName: buyerName.value, email: contact.value.email, phone: contact.value.phone })
  else if (firstType && !alreadyHolds) kept.unshift({ id: 'buyer', fullName: buyerName.value, email: contact.value.email, phone: contact.value.phone, ticketId: firstType, isBuyer: true })
  assignees.value = kept
  step.value = 'assign'
}
const tierOptions = computed<SelectOption[]>(() => {
  const current = editing.value ? assignees.value.find(a => a.id === editing.value) : undefined
  return props.tickets
    .filter(t => (quantities.value[t.id] ?? 0) > 0)
    .map((t) => {
      const left = (quantities.value[t.id] ?? 0) - assignedFor(t.id, current?.id)
      return { id: t.id, label: t.name, description: `${left} of ${quantities.value[t.id]} left to assign`, disabled: left <= 0 }
    })
})
function openAssignee(id: string | null) {
  editing.value = id
  step.value = 'assignee'
}
function saveAssignee(value: Omit<TicketAssignee, 'id' | 'isBuyer'>) {
  if (editing.value) {
    const a = assignees.value.find(x => x.id === editing.value)
    if (a) Object.assign(a, value)
  } else {
    assignees.value.push({ id: `a${Date.now().toString(36)}${assignees.value.length}`, ...value })
  }
  editing.value = null
  step.value = 'assign'
}

// Assigning is optional (decision 27 Oct): tickets nobody was assigned to go
// to the buyer, one row each, so every ticket in the order has a holder.
function withBuyerForUnassigned(): TicketAssignee[] {
  const list = [...assignees.value]
  for (const id of lines.value) {
    const left = (quantities.value[id] ?? 0) - list.filter(a => a.ticketId === id).length
    for (let n = 0; n < left; n++) list.push({ id: `buyer-${id}-${n}`, fullName: buyerName.value, email: contact.value.email, phone: contact.value.phone, ticketId: id, isBuyer: true })
  }
  return list
}

// ---- Paying ----
function order(): CheckoutOrder {
  const names = accountName.value ?? { firstName: details.value.firstName ?? '', lastName: details.value.lastName ?? '' }
  return {
    eventId: props.event.id,
    buyer: { ...contact.value, ...names, gender: details.value.gender, hasAccount: hasAccount.value },
    quantities: Object.fromEntries(props.tickets.map(t => [t.id, quantities.value[t.id] ?? 0]).filter(([, n]) => (n as number) > 0)),
    assignees: withBuyerForUnassigned(),
    total: total.value,
  }
}
async function finish(pay: boolean) {
  busy.value = true
  try {
    const o = order()
    const { orderId } = await createOrder(o)
    if (pay) await payOrder(orderId, o.total)
    await issueTickets(orderId, o)
    if (!user.value) setUser(await signInBuyer(o))
    purchased.value = true
    step.value = 'success'
  } finally {
    busy.value = false
  }
}
function proceedFromAssign() {
  if (total.value > 0) step.value = 'pay'
  else finish(false) // free tickets only: no payment step (decision 22 Oct, until the RSVP design)
}

// ---- Closing ----
function close() {
  if (purchased.value) {
    quantities.value = Object.fromEntries(props.tickets.map(t => [t.id, 0]))
    assignees.value = []
    emit('purchased')
  }
  emit('close')
}
/** Success screen "Close" / X: the buyer joins the community, then back to the event page */
async function closeSuccess() {
  if (busy.value) return
  if (purchased.value && user.value) {
    busy.value = true
    try { await joinEventChat(user.value.username, props.event.id) } finally { busy.value = false }
  }
  close()
}
function joinChat() {
  close()
  emit('join-chat')
}

// Move focus into each new step (the dialog only does it on open)
const modal = ref<{ focusFirst: () => void } | null>(null)
watch(step, () => nextTick(() => modal.value?.focusFirst()))
</script>

<template>
  <UiModal
    ref="modal"
    :open="open && step !== 'success'"
    :width="393"
    phone="sheet"
    card-class="checkout-card"
    :labelledby="titleId"
    fallback-focus="[data-account-trigger]"
    :dismissible="!busy"
    @close="close"
  >
    <CheckoutContactStep v-if="step === 'contact'" :title-id="titleId" :free="free" :initial="contact" :busy="busy" @close="close" @submit="onContact" />
    <CheckoutDetailsStep v-else-if="step === 'details'" :title-id="titleId" :initial="details" @close="close" @back="step = 'contact'" @submit="onDetails" />
    <CheckoutCartStep
      v-else-if="step === 'cart'"
      v-model:quantities="quantities"
      :title-id="titleId"
      :tickets="tickets"
      :lines="lines"
      :total="total"
      :free="free"
      :count="count"
      :can-add="notInCart.length > 0"
      @close="close"
      @back="backFromCart"
      @add="step = 'add'"
      @checkout="startAssigning"
    />
    <CheckoutAddTicketStep v-else-if="step === 'add'" :title-id="titleId" :tickets="notInCart" @close="close" @back="step = 'cart'" @add="addTicket" />
    <CheckoutAssignStep
      v-else-if="step === 'assign'"
      :title-id="titleId"
      :event-title="event.title"
      :tickets="tickets"
      :assignees="assignees"
      :count="count"
      :free="free"
      @close="close"
      @back="backFromAssign"
      @add="openAssignee(null)"
      @edit="openAssignee"
      @proceed="proceedFromAssign"
    />
    <CheckoutAssigneeStep
      v-else-if="step === 'assignee'"
      :key="editing ?? 'new'"
      :title-id="titleId"
      :event-title="event.title"
      :options="tierOptions"
      :initial="editing ? assignees.find(a => a.id === editing) : undefined"
      @close="close"
      @back="step = 'assign'; editing = null"
      @submit="saveAssignee"
    />
    <CheckoutPaymentStep v-else-if="step === 'pay'" :title-id="titleId" :event-title="event.title" :total="total" :count="count" :busy="busy" @close="close" @back="step = 'assign'" @pay="finish(true)" />
  </UiModal>

  <UiModal
    :open="open && step === 'success'"
    :width="479"
    phone="fullscreen"
    card-class="checkout-success-card"
    :labelledby="`${titleId}-done`"
    :dismissible="false"
    fallback-focus="[data-account-trigger]"
    @close="closeSuccess"
  >
    <CheckoutSuccessView :title-id="`${titleId}-done`" :photos="event.photos" :busy="busy" @close="closeSuccess" @join="joinChat" />
  </UiModal>
</template>
