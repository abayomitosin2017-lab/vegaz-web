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
const list = ref<HTMLElement | null>(null)
const foot = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)
const topHeight = ref(0)
const metaEl = ref<HTMLElement | null>(null)
const totalEl = ref<HTMLElement | null>(null)

/** Summary text and total travel and grow between the bar and the sheet (FLIP) */
async function morphSummary(change: () => void) {
  const els = [metaEl.value, totalEl.value].filter((e): e is HTMLElement => !!e)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const before = els.map(e => e.getBoundingClientRect())
  change()
  await nextTick()
  if (reduce) return
  els.forEach((el, i) => {
    const a = before[i]!
    const b = el.getBoundingClientRect()
    if (!a.width || !b.width) return // wasn't visible (nothing picked): it just fades in
    el.style.transition = 'none'
    el.style.transformOrigin = 'left top'
    el.style.transform = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.height / b.height})`
    void el.offsetWidth
    el.style.transition = 'transform 300ms cubic-bezier(0.23, 1, 0.32, 1)'
    el.style.transform = ''
  })
}
const titleId = useId()

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const summary = computed(() => (props.count > 0 ? `${plural(props.count, 'ticket')} · ${plural(props.tiers, 'tier')}` : 'No tickets yet'))
const totalLabel = computed(() => (props.count === 0 ? '₦0' : props.total === 0 ? 'Free' : formatNaira(props.total)))
const action = computed(() => (open.value ? 'Proceed' : props.free ? 'RSVP' : 'Buy Ticket'))
const inactive = computed(() => open.value && props.count === 0)

/** Sheet height: its content, but never above the page header */
function measure() {
  if (!open.value || !head.value || !list.value || !foot.value) return
  const header = document.querySelector<HTMLElement>('.event-sticky')?.offsetHeight ?? 61
  const room = window.innerHeight - header - foot.value.offsetHeight
  topHeight.value = Math.min(head.value.offsetHeight + list.value.scrollHeight, room)
}
async function openSheet() {
  await morphSummary(() => { open.value = true })
  document.documentElement.style.overflow = 'hidden'
  measure()
  closeBtn.value?.focus({ preventScroll: true })
}
function close() {
  if (!open.value) return
  morphSummary(() => { open.value = false; topHeight.value = 0 })
  document.documentElement.style.overflow = ''
  nextTick(() => panel.value?.querySelector<HTMLElement>('.mbuy__action')?.focus({ preventScroll: true }))
}
function onAction() {
  if (!open.value) { openSheet(); return }
  if (inactive.value) return
  close()
  emit('proceed')
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) { e.preventDefault(); close() }
}
watch(() => props.tickets.length, () => nextTick(measure))

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
  <div :class="['mbuy', { 'mbuy--open': open }]">
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
          <h2 :id="titleId" class="mbuy__title text-app-h2-bold">Buy Ticket</h2>
          <button ref="closeBtn" type="button" class="mbuy__close" aria-label="Close" @click="close">
            <img src="/images/pwa/icon-close-16.svg" alt="" width="16" height="16" />
          </button>
        </div>
        <ul ref="list" class="mbuy__list">
          <li v-for="t in tickets" :key="t.id">
            <TicketOption v-model:quantity="quantities[t.id]" :ticket="t" />
          </li>
        </ul>
      </div>

      <div ref="foot" class="mbuy__foot">
        <div :class="['mbuy__summary', { 'mbuy__summary--on': open || count > 0 }]" aria-live="polite">
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
.mbuy__title { margin: 0; color: var(--color-text-strong); } /* same title style as the other sheets and pop-ups (22/26 semibold, decision 28 Oct) */
.mbuy__close { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: var(--radius-pill); background: none; cursor: pointer; }
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

/* Fixed footer: summary + the one button (Buy Ticket -> Proceed) */
.mbuy__foot {
  display: flex;
  flex: none;
  flex-direction: column;
  padding: var(--spacing-md) var(--spacing-md) calc(var(--spacing-lg) + env(safe-area-inset-bottom, 0px));
  border-top: var(--border-width-default) solid transparent;
  transition: border-color 200ms ease;
}
.mbuy--open .mbuy__foot { border-top-color: var(--color-border-default); }
.mbuy__summary { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 200ms ease; }
.mbuy__summary--on { grid-template-rows: 1fr; opacity: 1; }
.mbuy__summary-inner { display: flex; align-items: center; justify-content: center; gap: var(--spacing-lg); min-height: 0; overflow: hidden; transition: margin-bottom 300ms cubic-bezier(0.23, 1, 0.32, 1); }
.mbuy__summary--on .mbuy__summary-inner { margin-bottom: var(--spacing-md); } /* bar: 16 above the button */
.mbuy--open .mbuy__summary-inner { justify-content: space-between; margin-bottom: var(--spacing-lg); } /* sheet: spread, 24 above */
.mbuy__divider { flex: none; width: 1px; height: 16px; background: color-mix(in srgb, var(--grey-1) 40%, transparent); transition: opacity 200ms ease; }
.mbuy--open .mbuy__divider { opacity: 0; width: 0; margin-inline: calc(-1 * var(--spacing-lg) / 2); }
.mbuy__meta { color: var(--color-text-secondary); font-family: var(--font-family-base); font-size: 14px; line-height: 18px; white-space: nowrap; }
.mbuy__total { display: inline-block; color: var(--color-text-strong); font-family: var(--font-family-base); font-size: 16px; font-weight: 700; line-height: 24px; white-space: nowrap; }
.mbuy__meta { display: inline-block; }
/* In the sheet the summary sits in its footer spot (Figma 14/20, 24/32 bold) */
.mbuy--open .mbuy__meta { line-height: 20px; }
.mbuy--open .mbuy__total { font-size: 24px; line-height: 32px; letter-spacing: -0.5px; }
.mbuy__action.ui-button { width: 100%; }

@media (prefers-reduced-motion: reduce) {
  .mbuy__top, .mbuy--open .mbuy__top, .mbuy__summary, .mbuy__summary-inner, .mbuy__meta, .mbuy__total, .mbuy__panel, .mbuy--open .mbuy__panel { transition: none; }
}
</style>
