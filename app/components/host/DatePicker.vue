<script setup lang="ts">
import './styles.css'
/**
 * Date picker pop-up (decision 24 Oct: replaces the browser's own picker).
 * Opens under the Date field. Look follows the design system's "Select
 * Date" modal (1727:38743): white, title "Select Date" (Body app bold 16/24
 * Grey_1), chosen value Primary bold, other values Grey_4, Grey_5 lines.
 * On the web a month grid is quicker than the phone wheels, so the values
 * sit in a calendar (PROPOSED layout):
 *   month + year with previous / next buttons; Mo-Su (x-Small, Grey_3);
 *   40px round days: chosen = Primary fill, white bold; today = Primary
 *   ring; past days Grey_4 and not pickable.
 * Keyboard: arrows move a day / week, Page Up / Page Down a month, Home /
 * End the week, Enter picks, Escape closes.
 */
const props = defineProps<{ modelValue: string; min?: string; labelledby?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; close: [] }>()

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y!, (m ?? 1) - 1, d ?? 1) }

const todayIso = iso(new Date())
const minIso = computed(() => props.min ?? todayIso)
const focused = ref(parse(props.modelValue || todayIso))
const view = ref(new Date(focused.value.getFullYear(), focused.value.getMonth(), 1))

const weeks = computed(() => {
  const first = view.value
  const lead = (first.getDay() + 6) % 7 // Monday first
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - lead)
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d)
    return { date: day, iso: iso(day), inMonth: day.getMonth() === first.getMonth() }
  })).filter(week => week.some(c => c.inMonth))
})
const canPrev = computed(() => iso(new Date(view.value.getFullYear(), view.value.getMonth(), 0)) >= minIso.value)

const grid = ref<HTMLElement | null>(null)
function focusDay() {
  nextTick(() => grid.value?.querySelector<HTMLElement>(`[data-iso="${iso(focused.value)}"]`)?.focus())
}
function shiftMonth(n: number) {
  view.value = new Date(view.value.getFullYear(), view.value.getMonth() + n, 1)
}
function moveFocus(days: number, months = 0) {
  const f = focused.value
  let next = new Date(f.getFullYear(), f.getMonth() + months, f.getDate() + days)
  if (iso(next) < minIso.value) next = parse(minIso.value)
  focused.value = next
  if (next.getMonth() !== view.value.getMonth() || next.getFullYear() !== view.value.getFullYear()) view.value = new Date(next.getFullYear(), next.getMonth(), 1)
  focusDay()
}
function pick(c: { iso: string }) {
  if (c.iso < minIso.value) return
  emit('update:modelValue', c.iso)
  emit('close')
}
function onKey(e: KeyboardEvent) {
  const map: Record<string, () => void> = {
    ArrowLeft: () => moveFocus(-1), ArrowRight: () => moveFocus(1), ArrowUp: () => moveFocus(-7), ArrowDown: () => moveFocus(7),
    PageUp: () => moveFocus(0, -1), PageDown: () => moveFocus(0, 1),
    Home: () => moveFocus(-((focused.value.getDay() + 6) % 7)), End: () => moveFocus(6 - ((focused.value.getDay() + 6) % 7)),
    Enter: () => pick({ iso: iso(focused.value) }), ' ': () => pick({ iso: iso(focused.value) }),
  }
  const fn = map[e.key]
  if (fn) { e.preventDefault(); fn() }
}
onMounted(focusDay)
</script>

<template>
  <div class="host-pop host-cal" role="dialog" aria-label="Select Date" @keydown.esc.stop.prevent="emit('close')">
    <p class="host-pop__title text-app-body-semibold">Select Date</p>
    <div class="host-cal__head">
      <button type="button" class="host-cal__nav host-cal__nav--prev" :disabled="!canPrev" aria-label="Previous month" @click="shiftMonth(-1)">
        <img src="/images/host/icon-chevron-right-16.svg" alt="" width="16" height="16" />
      </button>
      <p class="host-cal__month text-app-body-semibold" aria-live="polite">{{ MONTHS[view.getMonth()] }} {{ view.getFullYear() }}</p>
      <button type="button" class="host-cal__nav" aria-label="Next month" @click="shiftMonth(1)">
        <img src="/images/host/icon-chevron-right-16.svg" alt="" width="16" height="16" />
      </button>
    </div>
    <table ref="grid" class="host-cal__grid" role="grid" :aria-label="`${MONTHS[view.getMonth()]} ${view.getFullYear()}`" @keydown="onKey">
      <thead>
        <tr><th v-for="d in DAYS" :key="d" scope="col" class="text-app-xsmall-regular"><abbr :title="d">{{ d }}</abbr></th></tr>
      </thead>
      <tbody>
        <tr v-for="(week, w) in weeks" :key="w">
          <td v-for="c in week" :key="c.iso">
            <button
              v-if="c.inMonth"
              type="button"
              :data-iso="c.iso"
              :class="['host-cal__day text-app-small-semibold', { 'host-cal__day--on': c.iso === modelValue, 'host-cal__day--today': c.iso === todayIso }]"
              :tabindex="c.iso === iso(focused) ? 0 : -1"
              :disabled="c.iso < minIso"
              :aria-pressed="c.iso === modelValue"
              :aria-label="`${c.date.getDate()} ${MONTHS[c.date.getMonth()]} ${c.date.getFullYear()}${c.iso === todayIso ? ', today' : ''}`"
              @click="pick(c)"
            >{{ c.date.getDate() }}</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.host-cal { width: 320px; }
.host-cal__head { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-xs); }
.host-cal__month { margin: 0; color: var(--color-text-strong); }
.host-cal__nav {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; padding: 0;
  border: 0; border-radius: var(--radius-pill);
  background: var(--color-background-secondary);
  cursor: pointer;
}
.host-cal__nav--prev img { transform: scaleX(-1); }
.host-cal__nav:hover:not(:disabled) { background: var(--color-border-default); }
.host-cal__nav:disabled { opacity: 0.35; cursor: default; }
.host-cal__nav:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
.host-cal__grid { width: 100%; border-collapse: collapse; table-layout: fixed; }
.host-cal__grid th { padding: 0 0 var(--spacing-xs); color: var(--color-text-muted); font-weight: var(--font-weight-regular); }
.host-cal__grid abbr { text-decoration: none; }
.host-cal__grid td { padding: 2px 0; text-align: center; }
.host-cal__day {
  width: 40px; height: 40px; padding: 0;
  border: 0; border-radius: var(--radius-pill);
  background: none;
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  cursor: pointer;
  transition: background-color 120ms ease;
}
.host-cal__day:hover:not(:disabled) { background: var(--color-background-secondary); }
.host-cal__day--today { box-shadow: inset 0 0 0 1px var(--color-action-primary); color: var(--color-action-primary); }
.host-cal__day--on, .host-cal__day--on:hover:not(:disabled) { background: var(--color-action-primary); color: var(--base-white); font-weight: var(--font-weight-bold); box-shadow: none; }
.host-cal__day:disabled { color: var(--color-text-disabled); cursor: default; }
.host-cal__day:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 1px; }
</style>
