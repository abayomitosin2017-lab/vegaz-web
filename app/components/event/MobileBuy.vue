<script setup lang="ts">
/**
 * EventMobileBuy: phones only (< 768px). The Buy Ticket bar at the bottom of
 * the event page that grows into the Buy Ticket sheet (Figma "Vegaz web
 * bugs", section "Mobile · Buy ticket sheet", 80:2; decision 28 Oct).
 *
 * Bar (Figma 81:66 / 81:227, updated 28 Oct): white, top corners 40, 1px
 *   Grey_5 line on top, shadow 0 -4 16 (6%), 16 / 16 / 24 padding (+ safe area).
 *   - nothing picked: full-width 48 "Buy Ticket" ("RSVP" for free-only events);
 *   - something picked on the page: a centred summary 16 above the button:
 *     "2 tickets · 2 tiers" (14/18 Grey_2), a 1 x 16 line (Grey_1 at 40%) and
 *     the total (16/24 bold Grey_1), 24 apart.
 * Sheet (Figma 81:128 / 81:292 / 81:392), opened by the button:
 *   the same panel grows upwards (300ms, strong ease-out; closing 220ms) and
 *   the page dims (black 50%, over the header too). The button stays where it
 *   is and becomes "Proceed" (inactive until a ticket is picked); the corners
 *   go from 40 to 24, and the summary text and total move from the centre of
 *   the bar to their places in the sheet footer and grow there (FLIP: they
 *   travel and scale, 300ms; the reverse on closing). Inside:
 *   "Buy Ticket" (22/26 semibold, as in every other sheet; Figma 24/32) + 32 X (24 / 8 / 16 / 16 padding), the same ticket
 *   cards as the page (16 apart), and the fixed footer: Grey_5 line, summary
 *   (14/20 + total 24/32 bold, "No tickets yet / ₦0" when empty) 24 above
 *   Proceed. With many tiers the sheet stops at the bottom of the page header
 *   and only the cards scroll.
 * Picks are the page's own quantities (v-model), so page and sheet always
 * match. X, the dimmed page or Escape closes it. Proceed emits `proceed`.
 *
 * Client update 29 Oct (replaces parts of the above):
 *   - title "Confirm Ticket", button "Confirm"; close icon 20 (standard) in 36;
 *   - footer in the sheet: total (18/24 bold) over "2 tickets · 2 tiers"
 *     (14/18 Grey_2) on the left, Confirm (48, min 148) on the right; the
 *     bar's centred summary and full-width button morph into it;
 *   - opened after picking on the page: picked tiers first, then a small
 *     "Other Tiers" label (12/18 semibold Grey_3) and the rest; a tier picked
 *     from Other Tiers glides up and stays there (even back at 0) until the
 *     sheet closes. Opened with nothing picked: the normal order;
 *   - when cards are hidden below, the footer gets a soft top shadow
 *     (0 -6 16, 8%) so it reads as sitting over them.
 * Update 29 Oct (later): opening, the sheet grows and the page dims first;
 * 0.15s later (was 0.5s, then 0.2s) the button and summary move into their sheet places (the button
 * becomes Confirm). Closing moves everything at once. Tapping the summary in
 * the closed bar opens the sheet too.
 */
import type { TicketType } from '~/types/ticket'
import { formatNaira } from '~/utils/money'

const props = defineProps<{ tickets: TicketType[]; total: number; count: number; tiers: number; free?: boolean }>()
const quantities = defineModel<Record<string, number>>('quantities', { required: true })
const emit = defineEmits<{ proceed: [] }>()

const open = ref(false)
const panel = ref<HTMLElement | null>(null)
const top = ref<HTMLElement | null>(null)
const head = ref<HTMLElement | null>(null)
const listGroup = ref<{ $el: HTMLElement } | null>(null)
const list = computed(() => listGroup.value?.$el ?? null)
const foot = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)
const topHeight = ref(0)
const metaEl = ref<HTMLElement | null>(null)
const totalEl = ref<HTMLElement | null>(null)

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'
/**
 * Bar <-> sheet morph (FLIP): the count and total travel from the centre of
 * the bar to the left of the footer and grow; the button slides right and
 * narrows to "Confirm". The reverse on closing.
 */
// The button follows 0.15s after the sheet when opening (decision 29 Oct; was 0.5s, then 0.2s)
const BUTTON_DELAY = 150
const btnOpen = ref(false) // button already showing "Confirm"
const footOpen = ref(false) // footer in its sheet layout (summary left, Confirm right)
let btnTimer: ReturnType<typeof setTimeout> | undefined
async function morphSummary(change: () => void) {
  const text = [metaEl.value, totalEl.value].filter((e): e is HTMLElement => !!e)
  const btn = panel.value?.querySelector<HTMLElement>('.mbuy__action') ?? null
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const before = text.map(e => ({ r: e.getBoundingClientRect(), fs: parseFloat(getComputedStyle(e).fontSize) }))
  const btnBefore = btn?.getBoundingClientRect()
  change()
  await nextTick()
  if (reduce) return
  text.forEach((el, i) => {
    const a = before[i]!
    const b = el.getBoundingClientRect()
    if (!a.r.width || !b.width) return // wasn't visible (nothing picked): it just fades in
    const scale = a.fs / parseFloat(getComputedStyle(el).fontSize)
    el.style.transition = 'none'
    el.style.transformOrigin = 'left top'
    el.style.transform = `translate(${a.r.left - b.left}px, ${a.r.top - b.top}px) scale(${scale})`
    void el.offsetWidth
    el.style.transition = `transform 300ms ${EASE}`
    el.style.transform = ''
  })
  if (btn && btnBefore) {
    const b = btn.getBoundingClientRect()
    btn.style.transition = 'none'
    btn.style.width = `${btnBefore.width}px`
    const c = btn.getBoundingClientRect() // where it sits at its old width in the new layout
    btn.style.transform = `translate(${btnBefore.left - c.left}px, ${btnBefore.top - c.top}px)`
    void btn.offsetWidth
    const delay = 0
    btn.style.transition = `transform 300ms ${EASE} ${delay}ms, width 300ms ${EASE} ${delay}ms`
    btn.style.width = `${b.width}px`
    btn.style.transform = ''
    setTimeout(() => { btn.style.width = ''; btn.style.transition = '' }, delay + 320)
  }
}

// ---- Flow 2 (picked on the page first): picked tiers on top, then "Other Tiers" ----
// A tier picked inside the sheet moves up; it stays there (even back at 0)
// until the sheet closes (decision 29 Oct). Flow 1 keeps the normal order.
const grouped = ref(false)
const pickedIds = ref<string[]>([])
watch(quantities, (q) => {
  if (!open.value || !grouped.value) return
  for (const t of props.tickets) if ((q[t.id] ?? 0) > 0 && !pickedIds.value.includes(t.id)) pickedIds.value.push(t.id)
}, { deep: true })
type Row = { key: string; ticket?: TicketType }
const rows = computed<Row[]>(() => {
  if (!grouped.value) return props.tickets.map(t => ({ key: t.id, ticket: t }))
  const picked = props.tickets.filter(t => pickedIds.value.includes(t.id))
  const other = props.tickets.filter(t => !pickedIds.value.includes(t.id))
  return [...picked.map(t => ({ key: t.id, ticket: t })), ...(other.length ? [{ key: '__other' }] : []), ...other.map(t => ({ key: t.id, ticket: t }))]
})

// ---- Scroll shadow: the footer looks like it sits over the cards ----
const moreBelow = ref(false)
function checkScroll() {
  const l = list.value
  moreBelow.value = !!l && l.scrollHeight - l.scrollTop - l.clientHeight > 1
}
const titleId = useId()

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const summary = computed(() => (props.count > 0 ? `${plural(props.count, 'ticket')} · ${plural(props.tiers, 'tier')}` : 'No tickets yet'))
const totalLabel = computed(() => (props.count === 0 ? '₦0' : props.total === 0 ? 'Free' : formatNaira(props.total)))
const action = computed(() => (btnOpen.value ? 'Confirm' : props.free ? 'RSVP' : 'Buy Ticket'))
const inactive = computed(() => btnOpen.value && props.count === 0)

/** Sheet height: its content, but never above the page header */
function measure() {
  if (!open.value || !head.value || !list.value || !foot.value) return
  const header = document.querySelector<HTMLElement>('.event-sticky')?.offsetHeight ?? 61
  const room = window.innerHeight - header - foot.value.offsetHeight
  topHeight.value = Math.min(head.value.offsetHeight + list.value.scrollHeight, room)
  setTimeout(checkScroll, 320) // after the sheet has grown
}
async function openSheet() {
  grouped.value = props.count > 0
  pickedIds.value = props.tickets.filter(t => (quantities.value[t.id] ?? 0) > 0).map(t => t.id)
  if (list.value) list.value.scrollTop = 0
  clearTimeout(btnTimer)
  open.value = true // the sheet grows and the page dims first...
  await nextTick()
  // ...then, 0.15s later, the button (with the summary) moves into place and becomes Confirm
  btnTimer = setTimeout(async () => {
    if (!open.value) return
    const footBefore = foot.value?.offsetHeight ?? 0
    await morphSummary(() => { footOpen.value = true; btnOpen.value = true })
    // The footer gets shorter (summary moves beside the button): hold the
    // sheet's height for a frame, then let its top settle smoothly
    const shrink = footBefore - (foot.value?.offsetHeight ?? 0)
    if (shrink > 0 && top.value) {
      top.value.style.transition = 'none'
      topHeight.value += shrink
      await nextTick()
      void top.value.offsetHeight
      top.value.style.transition = ''
      measure()
    }
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : BUTTON_DELAY)
  document.documentElement.style.overflow = 'hidden'
  measure()
  closeBtn.value?.focus({ preventScroll: true })
}
function close() {
  if (!open.value) return
  clearTimeout(btnTimer)
  morphSummary(() => { open.value = false; footOpen.value = false; btnOpen.value = false; topHeight.value = 0 })
  document.documentElement.style.overflow = ''
  nextTick(() => panel.value?.querySelector<HTMLElement>('.mbuy__action')?.focus({ preventScroll: true }))
}
function onAction() {
  if (!open.value) { openSheet(); return }
  if (!btnOpen.value || inactive.value) return // still turning into Confirm, or nothing picked
  close()
  emit('proceed')
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) { e.preventDefault(); close() }
}
watch(() => props.tickets.length, () => nextTick(measure))
watch(rows, () => nextTick(() => { measure(); checkScroll() }))

// Room under the page (and the chat dock / PWA banner) for the closed bar
const { bottomOffset } = useChatDock()
let ro: ResizeObserver | undefined
let footRo: ResizeObserver | undefined
onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', measure)
  ro = new ResizeObserver(() => {
    if (open.value || !panel.value) return
    const h = panel.value.offsetHeight
    bottomOffset.value = h
    document.body.style.paddingBottom = `${h}px`
  })
  if (panel.value) ro.observe(panel.value)
  // The footer grows when the summary slides in: keep the sheet under the header
  footRo = new ResizeObserver(() => { if (open.value) measure() })
  if (foot.value) footRo.observe(foot.value)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', measure)
  ro?.disconnect()
  footRo?.disconnect()
  bottomOffset.value = 0
  document.body.style.paddingBottom = ''
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div :class="['mbuy', { 'mbuy--open': open, 'mbuy--foot': footOpen }]">
    <div class="mbuy__scrim" aria-hidden="true" @click="close" />
    <section
      ref="panel"
      class="mbuy__panel"
      :role="open ? 'dialog' : 'region'"
      :aria-modal="open ? 'true' : undefined"
      :aria-labelledby="open ? titleId : undefined"
      :aria-label="open ? undefined : 'Your tickets'"
    >
      <div ref="top" class="mbuy__top" :style="{ height: `${topHeight}px` }" :inert="!open || undefined">
        <div ref="head" class="mbuy__head">
          <h2 :id="titleId" class="mbuy__title text-app-h2-bold">Confirm Ticket</h2>
          <button ref="closeBtn" type="button" class="mbuy__close" aria-label="Close" @click="close">
            <img src="/images/chat/icon-close-20.svg" alt="" width="20" height="20" />
          </button>
        </div>
        <TransitionGroup ref="listGroup" tag="ul" name="mbuy-row" class="mbuy__list" @scroll.passive="checkScroll">
          <li v-for="row in rows" :key="row.key" :class="{ 'mbuy__other': !row.ticket }">
            <TicketOption v-if="row.ticket" v-model:quantity="quantities[row.ticket.id]" :ticket="row.ticket" />
            <template v-else>Other Tiers</template>
          </li>
        </TransitionGroup>
      </div>

      <div ref="foot" :class="['mbuy__foot', { 'mbuy__foot--shadow': open && moreBelow }]">
        <!-- Closed bar: tapping the summary opens the sheet too (decision 29 Oct) -->
        <div
          :class="['mbuy__summary', { 'mbuy__summary--on': footOpen || count > 0, 'mbuy__summary--tap': !open && count > 0 }]"
          aria-live="polite"
          :role="!open && count > 0 ? 'button' : undefined"
          :tabindex="!open && count > 0 ? 0 : undefined"
          :aria-label="!open && count > 0 ? `${summary}, ${totalLabel}. Show tickets` : undefined"
          @click="!open && count > 0 && openSheet()"
          @keydown.enter.space.prevent="!open && count > 0 && openSheet()"
        >
          <div class="mbuy__summary-inner">
            <span ref="metaEl" class="mbuy__meta">{{ summary }}</span>
            <span class="mbuy__divider" aria-hidden="true" />
            <span ref="totalEl" class="mbuy__total">{{ totalLabel }}</span>
          </div>
        </div>
        <UiButton
          class="mbuy__action"
          text-style="web"
          :color="inactive ? 'secondary' : 'primary'"
          :aria-disabled="inactive ? 'true' : undefined"
          :aria-haspopup="open ? undefined : 'dialog'"
          @click="onAction"
        >{{ action }}</UiButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.mbuy { display: contents; }
@media (min-width: 768px) { .mbuy__scrim, .mbuy__panel { display: none; } }

.mbuy__scrim {
  position: fixed;
  inset: 0;
  z-index: 115; /* over the event header (101) */
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 220ms ease, visibility 0s linear 220ms;
}
.mbuy--open .mbuy__scrim { opacity: 1; visibility: visible; transition: opacity 300ms ease, visibility 0s; }

.mbuy__panel {
  position: fixed;
  inset: auto 0 0;
  z-index: 116;
  display: flex;
  flex-direction: column;
  border-top: var(--border-width-default) solid var(--color-border-default);
  border-radius: 40px 40px 0 0; /* bar (Figma 28 Oct); 24 as a sheet */
  background: var(--color-background-primary);
  box-shadow: 0 -4px 16px rgba(17, 17, 26, 0.06);
  transition: border-radius 220ms ease;
}
.mbuy--open .mbuy__panel { border-radius: var(--radius-lg) var(--radius-lg) 0 0; transition: border-radius 300ms cubic-bezier(0.23, 1, 0.32, 1); }
.mbuy--open .mbuy__panel { border-top-color: transparent; }

/* The part that grows: header + cards */
.mbuy__top {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: height 220ms cubic-bezier(0.4, 0, 1, 1);
}
.mbuy--open .mbuy__top { transition: height 300ms cubic-bezier(0.23, 1, 0.32, 1); }
.mbuy__head {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xs) var(--spacing-md) var(--spacing-md);
}
/* 20 close icon, the standard icon size (decision 29 Oct) */
.mbuy__title { margin: 0; color: var(--color-text-strong); } /* same title style as the other sheets and pop-ups (22/26 semibold, decision 28 Oct) */
.mbuy__close { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: var(--radius-pill); background: none; cursor: pointer; }
.mbuy__close:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
.mbuy__list {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--spacing-md);
  min-height: 0;
  margin: 0;
  padding: 0 var(--spacing-md) var(--spacing-md);
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
}
/* "Other Tiers": small grey label, 8 above the first other tier (gap 16 - 8) */
.mbuy__other { margin: var(--spacing-xs) 0 calc(-1 * var(--spacing-xs)); color: var(--color-text-muted); font-family: var(--font-family-base); font-size: 12px; font-weight: var(--font-weight-semibold); line-height: 18px; }
/* A tier picked from "Other Tiers" glides up into the picked group */
.mbuy-row-move { transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1); }

/* Fixed footer: summary + the one button (Buy Ticket -> Proceed) */
.mbuy__foot {
  display: flex;
  flex: none;
  flex-direction: column;
  padding: var(--spacing-md) var(--spacing-md) calc(var(--spacing-lg) + env(safe-area-inset-bottom, 0px));
  border-top: var(--border-width-default) solid transparent;
  transition: border-color 200ms ease;
}
.mbuy--foot .mbuy__foot {
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-md);
  border-top-color: var(--color-border-default);
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
/* Cards hidden below: a soft shadow so the footer reads as sitting on top */
.mbuy__foot--shadow { box-shadow: 0 -6px 16px rgba(17, 17, 26, 0.08); }
.mbuy__summary { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 200ms ease; }
.mbuy__summary--on { grid-template-rows: 1fr; opacity: 1; }
.mbuy__summary-inner { display: flex; align-items: center; justify-content: center; gap: var(--spacing-lg); min-height: 0; overflow: hidden; transition: margin-bottom 300ms cubic-bezier(0.23, 1, 0.32, 1); }
.mbuy__summary--on .mbuy__summary-inner { margin-bottom: var(--spacing-md); } /* bar: 16 above the button */
.mbuy--foot .mbuy__summary { flex: 1; min-width: 0; }
/* Sheet (decision 29 Oct): total over count on the left, Confirm on the right */
.mbuy--foot .mbuy__summary-inner { flex-direction: column-reverse; align-items: flex-start; justify-content: center; gap: 2px; margin-bottom: 0; }
.mbuy__summary--tap { cursor: pointer; -webkit-tap-highlight-color: transparent; border-radius: var(--radius-sm); }
.mbuy__summary--tap:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 4px; }
.mbuy__divider { flex: none; width: 1px; height: 16px; background: color-mix(in srgb, var(--grey-1) 40%, transparent); }
.mbuy--foot .mbuy__divider { display: none; }
.mbuy__meta { color: var(--color-text-secondary); font-family: var(--font-family-base); font-size: 14px; line-height: 18px; white-space: nowrap; }
.mbuy__total { display: inline-block; color: var(--color-text-strong); font-family: var(--font-family-base); font-size: 16px; font-weight: 700; line-height: 24px; white-space: nowrap; }
.mbuy__meta { display: inline-block; }
/* In the sheet: total 18/24 bold over the count 14/18 (as the earlier bar) */
.mbuy--foot .mbuy__total { font-size: 18px; line-height: 24px; }
.mbuy__action.ui-button { width: 100%; }
.mbuy--foot .mbuy__action.ui-button { flex: none; width: auto; min-width: 148px; }

@media (prefers-reduced-motion: reduce) {
  .mbuy__top, .mbuy--open .mbuy__top, .mbuy__summary, .mbuy__summary-inner, .mbuy__meta, .mbuy__total, .mbuy__panel, .mbuy--open .mbuy__panel { transition: none; }
}
</style>
