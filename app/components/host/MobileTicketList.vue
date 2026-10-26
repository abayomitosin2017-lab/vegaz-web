<script setup lang="ts">
import './styles.css'
import type { DraftTicket } from '~/types/hosting'
import { formatNaira, priceRange } from '~/utils/money'
/**
 * Phone "Ticket Pricing" list (Figma mobile Ticket Details 10754:71782 /
 * 10754:71966). Each card: 4px coloured line on the left (in turn Primary,
 * Positive, Warning, #141316), white, 0.5px dashed Grey_5 on the other
 * sides, 0 4 24 shadow at 5%, 16 padding. Inside: chips (#F4F5F8, radius 40,
 * 4 / 12 padding, Small semibold #141316: name, then person icon + quantity),
 * price 24/28, description x-Small Grey_3; edit and delete (34px, #F4F5F8,
 * 0.5px Grey_5); a 1px Grey_5 line; the drag handle.
 * Under the list: "+ Add new ticket" (Small semibold Primary, centred).
 * Empty: #F4F5F8 box (radius 16, 259 tall), ticket drawing, "No ticket has
 * been created yet" and "+ Create Ticket".
 * Drag handle: drag the card up or down to reorder (touch, mouse, or arrow
 * keys on the focused handle). Order is kept for the event page.
 */
const tickets = defineModel<DraftTicket[]>('tickets', { required: true })
defineEmits<{ create: []; edit: [ticket: DraftTicket]; delete: [ticket: DraftTicket] }>()

const ACCENTS = ['var(--color-action-primary)', 'var(--base-positive)', 'var(--base-warning)', 'var(--color-text-checkout)']
const qty = (q: number | null) => (q === null ? 'Unlimited' : String(q))
const chips = (t: DraftTicket) => t.kind === 'gender' && t.lines.length > 1 ? t.lines.map((l, i) => `${i === 0 ? 'F' : 'M'} ${qty(l.quantity)}`) : [qty(t.lines[0]?.quantity ?? null)]
const price = (t: DraftTicket) => (t.lines.length > 1 ? priceRange(t.lines.map(l => l.price)) : formatNaira(t.lines[0]?.price ?? 0))
const description = (t: DraftTicket) => t.lines.map(l => l.description).find(Boolean) ?? ''

// ---- reorder ----
const list = ref<HTMLElement | null>(null)
const dragging = ref<string | null>(null)
const message = ref('')
function move(from: number, to: number) {
  if (to < 0 || to >= tickets.value.length || from === to) return
  const next = [...tickets.value]
  const [t] = next.splice(from, 1)
  next.splice(to, 0, t!)
  tickets.value = next
}
// Listen on the window while dragging: moving a card in the list moves its
// handle in the page, which would drop a pointer capture
function onDown(e: PointerEvent, t: DraftTicket) {
  e.preventDefault()
  dragging.value = t.id
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp, { once: true })
  window.addEventListener('pointercancel', onUp, { once: true })
}
function onMove(e: PointerEvent) {
  if (!dragging.value || !list.value) return
  const cards = [...list.value.querySelectorAll<HTMLElement>('.host-mcard')]
  const from = tickets.value.findIndex(t => t.id === dragging.value)
  for (let i = 0; i < cards.length; i++) {
    const r = cards[i]!.getBoundingClientRect()
    if (i !== from && e.clientY > r.top && e.clientY < r.bottom) {
      if ((i > from && e.clientY > r.top + r.height / 2) || (i < from && e.clientY < r.top + r.height / 2)) move(from, i)
      break
    }
  }
}
function onUp() {
  window.removeEventListener('pointermove', onMove)
  if (dragging.value) {
    const i = tickets.value.findIndex(t => t.id === dragging.value)
    message.value = `Moved to position ${i + 1} of ${tickets.value.length}`
  }
  dragging.value = null
}
function onKey(e: KeyboardEvent, i: number) {
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
  e.preventDefault()
  const to = i + (e.key === 'ArrowUp' ? -1 : 1)
  move(i, to)
  message.value = `Moved to position ${Math.max(1, Math.min(tickets.value.length, to + 1))} of ${tickets.value.length}`
  nextTick(() => list.value?.querySelectorAll<HTMLElement>('.host-mcard__drag')[Math.max(0, Math.min(tickets.value.length - 1, to))]?.focus())
}
onBeforeUnmount(onUp)
</script>

<template>
  <div v-if="!tickets.length" class="host-mempty">
    <span class="host-empty__art host-empty__art--tickets" aria-hidden="true"><img src="/images/host/empty-tickets.svg" alt="" width="303" height="96" /></span>
    <div class="host-mempty__text">
      <p class="text-app-small-semibold">No ticket has been created yet</p>
      <button type="button" class="host-mlink text-app-small-semibold" @click="$emit('create')">
        <img src="/images/host/m-add-primary-18.svg" alt="" width="18" height="18" />Create Ticket
      </button>
    </div>
  </div>
  <div v-else ref="list" class="host-mticket-wrap">
    <TransitionGroup tag="ul" name="host-list" class="host-mcards" aria-label="Your tickets">
      <li v-for="(t, i) in tickets" :key="t.id" :class="['host-mcard', { 'host-mcard--drag': dragging === t.id }]" :style="{ '--accent': ACCENTS[i % 4] }">
        <div class="host-mcard__main">
          <div class="host-mcard__chips">
            <span class="host-mcard__chip text-app-small-semibold">{{ t.name }}</span>
            <span v-for="c in chips(t)" :key="c" class="host-mcard__chip text-app-small-semibold">
              <img src="/images/host/icon-user-16.svg" alt="" width="16" height="16" /><span class="host-visually-hidden">Quantity: </span>{{ c }}
            </span>
          </div>
          <p class="host-mcard__price">{{ price(t) }}</p>
          <p v-if="description(t)" class="host-mcard__desc text-app-xsmall-regular">{{ description(t) }}</p>
        </div>
        <div class="host-mcard__actions">
          <button type="button" class="host-mcard__btn" :aria-label="`Edit ${t.name}`" @click="$emit('edit', t)"><img src="/images/host/icon-pen-18.svg" alt="" width="16" height="16" /></button>
          <button type="button" class="host-mcard__btn" :aria-label="`Delete ${t.name}`" @click="$emit('delete', t)"><img src="/images/host/icon-delete-18.svg" alt="" width="16" height="16" /></button>
        </div>
        <span class="host-mcard__line" aria-hidden="true" />
        <button
          type="button"
          class="host-mcard__drag"
          :aria-label="`Reorder ${t.name}: drag, or use the up and down arrow keys`"
          @pointerdown="onDown($event, t)"
          @keydown="onKey($event, i)"
        ><img src="/images/host/m-drag-24.svg" alt="" width="24" height="24" /></button>
      </li>
    </TransitionGroup>
    <button type="button" class="host-mlink host-mlink--center text-app-small-semibold" @click="$emit('create')">
      <img src="/images/host/m-add-primary-18.svg" alt="" width="18" height="18" />Add new ticket
    </button>
    <p class="host-visually-hidden" aria-live="polite">{{ message }}</p>
  </div>
</template>

<style scoped>
.host-mticket-wrap { display: flex; flex-direction: column; gap: var(--spacing-lg); }
.host-mcards { display: flex; flex-direction: column; gap: var(--spacing-md); margin: 0; padding: 0; list-style: none; }
.host-mcard {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-md);
  padding: calc(var(--spacing-md) - 0.5px) calc(var(--spacing-md) - 0.5px) calc(var(--spacing-md) - 0.5px) calc(var(--spacing-md));
  border: 0.5px dashed var(--color-border-default);
  border-left: 4px solid var(--accent);
  background: var(--color-background-primary);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  transition: box-shadow 150ms ease, transform 150ms ease;
}
.host-mcard--drag { z-index: 1; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); transform: scale(1.01); }
.host-mcard__main { flex: 1 0 0; min-width: 0; display: flex; flex-direction: column; gap: var(--spacing-xs); }
.host-mcard__chips { display: flex; flex-wrap: wrap; gap: var(--spacing-xs); margin-bottom: var(--spacing-md); }
.host-mcard__chip { display: inline-flex; align-items: center; gap: var(--spacing-xxs); max-width: 100%; padding: var(--spacing-xxs) var(--spacing-sm); border-radius: var(--radius-pill); background: var(--color-host-empty); color: var(--color-text-checkout); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.host-mcard__price { margin: 0; color: var(--color-text-checkout); font-family: var(--font-family-base); font-weight: var(--text-stat-weight); font-size: var(--text-stat-size); line-height: var(--text-stat-line); letter-spacing: var(--text-stat-tracking); }
.host-mcard__desc { margin: 0; color: var(--color-text-muted); }
.host-mcard__actions { flex: none; display: flex; gap: var(--spacing-xs); }
.host-mcard__btn { display: inline-flex; padding: calc(var(--spacing-xs) - 0.5px); border: 0.5px solid var(--color-border-default); border-radius: var(--radius-pill); background: var(--color-host-empty); cursor: pointer; }
.host-mcard__btn:focus-visible, .host-mcard__drag:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 1px; }
.host-mcard__line { align-self: stretch; flex: none; width: 1px; margin: calc(-1 * var(--spacing-md)) 0; background: var(--color-border-default); }
.host-mcard__drag { align-self: center; flex: none; display: inline-flex; padding: 0; border: 0; background: none; cursor: grab; touch-action: none; border-radius: var(--radius-xs); }
.host-mcard__drag:active { cursor: grabbing; }

.host-mempty {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2xl);
  min-height: 259px;
  padding: 44px;
  border-radius: 16px;
  background: var(--color-host-empty);
  overflow: hidden;
  text-align: center;
}
.host-mempty__text { display: flex; flex-direction: column; align-items: center; gap: var(--spacing-xs); }
.host-mempty__text p { margin: 0; color: var(--color-text-option); }
.host-mlink { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; color: var(--color-action-primary); font-family: var(--font-family-base); cursor: pointer; border-radius: var(--radius-xs); }
.host-mlink--center { align-self: center; }
.host-mlink:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
</style>
