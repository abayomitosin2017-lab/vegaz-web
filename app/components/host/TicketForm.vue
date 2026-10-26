<script setup lang="ts">
import './styles.css'
import type { DraftTicket, TicketKind, TicketKindOption, TicketPriceLine } from '~/types/hosting'
import type { SelectOption } from '~/components/checkout/Select.vue'
import { presetName } from '~/services/hosting'
import { guestPrice } from '~/utils/fees'
import { formatNaira } from '~/utils/money'
/**
 * "Create ticket" form on the Date & tickets / Tickets step (Figma frames
 * 07, 09-15b). It sits on the page; each ticket added shows as a card in
 * the side panel (decision 23 Oct).
 *
 * Section header: "Create ticket" + "Add as many ticket types as you need.
 * Each one appears on the right." (editing: "Edit ticket" + "Update this
 * ticket, then save your changes.").
 * Fields by ticket type (as drawn):
 *   Custom        Name, Price, fee note, Quantity, Description
 *   First to Buy / Early Bird
 *                 Price, fee note, Quantity, Description
 *   Gender-Based  "FEMALE" chip + Price, Quantity, Description; then "MALE".
 *                 "Add" creates two tickets, "FEMALE TICKET" and "MALE TICKET"
 *                 (decision 26 Oct). Editing one shows only its own group.
 *   Free          Quantity, Description
 * Fields 17 apart (Figma). Fee note (Grey_6, 0.5px Grey_5, radius 12,
 * 12px padding, x-Small regular): shows once a price is typed, with the
 * guest price in bold (10% capped at ₦3,000, utils/fees.ts).
 * Actions: "Add ticket" (200px; primary once the ticket is complete); while
 * editing, "Cancel" (140) + "Save changes" (200), 16 apart.
 * Complete = a type is chosen, Custom has a name, paid types have a price.
 * Description is optional, up to 100 characters ("0/100 Characters").
 */
const props = defineProps<{ kinds: TicketKindOption[]; editing: DraftTicket | null; phone?: boolean }>()
const emit = defineEmits<{ add: [ticket: DraftTicket]; save: [ticket: DraftTicket]; cancel: [] }>()

interface LineForm { price: string; quantity: number; unlimited: boolean; description: string }
const blankLine = (): LineForm => ({ price: '', quantity: 1, unlimited: false, description: '' })

const kind = ref<TicketKind | null>(null)
const name = ref('')
const lines = ref<LineForm[]>([blankLine()])

const options = computed<SelectOption[]>(() => props.kinds.map(k => ({ id: k.id, label: k.label, description: k.description, chip: k.preset ? 'Preset' : undefined, chipTone: 'preset' })))
const kindModel = computed({
  get: () => kind.value,
  set: (v: string | null) => { kind.value = v as TicketKind | null },
})

// Gender-based has two groups (female, male) when creating; editing one of
// the two tickets it made shows only that ticket's group
const editGender = ref<'female' | 'male' | null>(null)
watch(kind, k => {
  const want = k === 'gender' && !editGender.value ? 2 : 1
  while (lines.value.length < want) lines.value.push(blankLine())
  if (lines.value.length > want) lines.value = lines.value.slice(0, want)
})

function load(t: DraftTicket | null) {
  editGender.value = t?.kind === 'gender' && t.gender ? t.gender : null
  if (!t) { kind.value = null; name.value = ''; lines.value = [blankLine()]; return }
  kind.value = t.kind
  name.value = t.kind === 'custom' ? t.name : ''
  lines.value = t.lines.map(l => ({ price: l.price ? l.price.toLocaleString('en-NG') : '', quantity: l.quantity ?? 1, unlimited: l.quantity === null, description: l.description }))
}
watch(() => props.editing, t => load(t), { immediate: true })

const isPaid = computed(() => kind.value !== null && kind.value !== 'free')
const priceOf = (l: LineForm) => Number(l.price.replace(/\D/g, '')) || 0
const ready = computed(() => {
  if (!kind.value) return false
  if (kind.value === 'custom' && !name.value.trim()) return false
  if (isPaid.value && lines.value.some(l => priceOf(l) <= 0)) return false
  return true
})

function onPrice(l: LineForm, e: Event) {
  const el = e.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '').slice(0, 9)
  l.price = digits ? Number(digits).toLocaleString('en-NG') : ''
  el.value = l.price
}

const toLine = (l: LineForm, k: TicketKind): TicketPriceLine => ({
  price: k === 'free' ? 0 : priceOf(l),
  quantity: l.unlimited ? null : l.quantity,
  description: l.description.trim(),
})
const genderName = (g: 'female' | 'male') => (g === 'female' ? 'FEMALE TICKET' : 'MALE TICKET')
/** The ticket(s) this form makes: two for a new gender-based ticket */
function build(id: string | null): DraftTicket[] {
  const k = kind.value!
  if (k === 'gender') {
    const genders: ('female' | 'male')[] = editGender.value ? [editGender.value] : ['female', 'male']
    return genders.map((g, i) => ({ id: id ?? crypto.randomUUID(), kind: k, gender: g, name: genderName(g), lines: [toLine(lines.value[i]!, k)] }))
  }
  return [{ id: id ?? crypto.randomUUID(), kind: k, name: k === 'custom' ? name.value.trim() : presetName(k), lines: lines.value.map(l => toLine(l, k)) }]
}
function submit() {
  if (!ready.value) return
  if (props.editing) emit('save', build(props.editing.id)[0]!)
  else {
    build(null).forEach(t => emit('add', t))
    load(null)
  }
}
const groupLabel = (i: number) => (kind.value !== 'gender' ? '' : (editGender.value ?? (i === 0 ? 'female' : 'male')).toUpperCase())
const id = useId()
</script>

<template>
  <section :class="['host-section host-ticket-form', { 'host-ticket-form--phone': phone }]" :aria-labelledby="phone ? undefined : `${id}-h`" :aria-label="phone ? (editing ? 'Edit ticket' : 'Create ticket') : undefined">
    <h3 v-if="!phone" :id="`${id}-h`" class="host-section__title text-body-semibold">{{ editing ? 'Edit ticket' : 'Create ticket' }}</h3>
    <p v-if="!phone" class="host-section__copy text-xsmall-regular">{{ editing ? 'Update this ticket, then save your changes.' : 'Add as many ticket types as you need. Each one appears on the right.' }}</p>

    <div class="host-ticket-form__fields">
      <CheckoutSelect v-model="kindModel" variant="host" :options="options" label="Ticket Type" placeholder="Select Type" />

      <div v-if="kind === 'custom'" class="host-field">
        <label :for="`${id}-name`" class="host-field__label text-app-small-semibold">Ticket Name</label>
        <input :id="`${id}-name`" v-model="name" class="host-input" type="text" maxlength="40" placeholder="Enter ticket name here" />
      </div>

      <template v-for="(l, i) in lines" :key="i">
        <span v-if="kind === 'gender'" class="host-ticket-form__gender text-app-small-semibold">
          <img src="/images/host/icon-user-16.svg" alt="" width="16" height="16" />{{ groupLabel(i) }}
        </span>
        <div v-if="kind" class="host-ticket-form__group" :role="kind === 'gender' ? 'group' : undefined" :aria-label="kind === 'gender' ? `${groupLabel(i)} ticket` : undefined">
          <div v-if="isPaid" class="host-field">
            <label :for="`${id}-p${i}`" class="host-field__label text-app-small-semibold">Ticket Price(₦)</label>
            <input :id="`${id}-p${i}`" class="host-input" type="text" inputmode="numeric" :value="l.price" placeholder="Enter ticket price here" @input="onPrice(l, $event)" />
          </div>
          <p v-if="isPaid && kind !== 'gender' && priceOf(l) > 0" class="host-note host-ticket-form__fee text-app-xsmall-regular" aria-live="polite">
            A fee of 10%, capped at ₦3,000, will be included in the ticket price. Your guest will see the price as <strong>{{ formatNaira(guestPrice(priceOf(l))) }}</strong>
          </p>
          <HostQuantityField v-model:quantity="l.quantity" v-model:unlimited="l.unlimited" :label="kind === 'gender' ? `Ticket Quantity` : 'Ticket Quantity'" />
          <div class="host-field">
            <label :for="`${id}-d${i}`" class="host-field__label text-app-small-semibold">Ticket Description</label>
            <div class="host-textarea">
              <textarea :id="`${id}-d${i}`" v-model="l.description" rows="2" maxlength="100" placeholder="Enter short ticket description" :aria-describedby="`${id}-c${i}`" />
              <span :id="`${id}-c${i}`" class="host-textarea__count text-app-small-regular">{{ l.description.length }}/100 Characters</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="host-ticket-form__actions">
      <UiButton v-if="editing && !phone" class="host-ticket-form__cancel" color="secondary" @click="emit('cancel')">Cancel</UiButton>
      <UiButton
        :class="['host-ticket-form__submit', { 'host-inactive': !ready }]"
        :color="ready ? 'primary' : 'secondary'"
        :aria-disabled="!ready ? 'true' : undefined"
        @click="submit"
      >{{ phone ? (editing ? 'Save Changes' : 'Add Ticket') : (editing ? 'Save changes' : 'Add ticket') }}</UiButton>
    </div>
  </section>
</template>

<style scoped>
.host-ticket-form__fields { display: flex; flex-direction: column; gap: 17px; }
.host-ticket-form__group { display: flex; flex-direction: column; gap: 17px; }
.host-ticket-form__fee { padding: var(--spacing-sm); }
.host-ticket-form__gender {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: fit-content;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-pill);
  background: var(--color-background-secondary);
  color: var(--color-text-option);
}
.host-ticket-form__actions { display: flex; gap: var(--spacing-md); }
/* Phones (Figma mobile Create Ticket): the screen has the title; the button
   sits 40px above the bottom, 327 wide, over a white fade */
.host-ticket-form--phone { padding-bottom: 112px; }
.host-ticket-form--phone .host-ticket-form__actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  justify-content: center;
  padding: var(--spacing-md) var(--spacing-lg) calc(var(--spacing-2xl) + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), var(--base-white) 30%);
}
.host-ticket-form--phone .host-ticket-form__submit.ui-button { width: min(327px, 100%); }
</style>
