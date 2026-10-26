<script setup lang="ts">
import './styles.css'
import type { Ref } from 'vue'
/**
 * Time picker pop-up (decision 24 Oct: replaces the browser's own picker).
 * Follows the design system's "Time Select", Style=AM/PM (2563:43268) and
 * "Select Time" modal (2571:42980): title "Select Time" (Body app bold
 * 16/24 Grey_1); three columns (hour, minutes, AM/PM) with the chosen value
 * in Primary bold 16/24 between two Grey_5 lines and the others Grey_4
 * 14/20; a ":" between hours and minutes; full-width "Save" (Primary).
 * The columns scroll (mouse wheel, drag on touch, or click a value).
 * Minutes come in steps of 5 (PROPOSED). Keyboard: Up / Down change the
 * focused column, Tab moves between columns, Enter saves, Escape closes.
 */
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; close: [] }>()

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)
const PERIODS = ['AM', 'PM'] as const

function split(v: string) {
  const [hh, mm] = (v || '17:00').split(':').map(Number)
  const h = hh ?? 17
  return { hour: (h % 12) || 12, minute: Math.round((mm ?? 0) / 5) * 5 % 60, period: (h < 12 ? 'AM' : 'PM') as 'AM' | 'PM' }
}
const start = split(props.modelValue)
const hour = ref(start.hour)
const minute = ref(start.minute)
const period = ref<'AM' | 'PM'>(start.period)

const pad = (n: number) => String(n).padStart(2, '0')
function save() {
  const h24 = (hour.value % 12) + (period.value === 'PM' ? 12 : 0)
  emit('update:modelValue', `${pad(h24)}:${pad(minute.value)}`)
  emit('close')
}

type Col = 'hour' | 'minute' | 'period'
const cols = { hour: HOURS, minute: MINUTES, period: PERIODS as unknown as string[] } as Record<Col, (number | string)[]>
const model = { hour, minute, period } as Record<Col, Ref<number | string>>
function step(col: Col, dir: 1 | -1) {
  const list = cols[col]
  const i = list.indexOf(model[col].value)
  model[col].value = list[(i + dir + list.length) % list.length]!
  center(col)
}
function onKey(col: Col, e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); step(col, 1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); step(col, -1) }
  else if (e.key === 'Enter') { e.preventDefault(); save() }
}
// Wheel: one value per notch, so it doesn't fly past
let wheelLock = 0
function onWheel(col: Col, e: WheelEvent) {
  e.preventDefault()
  const now = Date.now()
  if (now - wheelLock < 80) return
  wheelLock = now
  step(col, e.deltaY > 0 ? 1 : -1)
}

const lists = ref<Record<string, HTMLElement | null>>({})
function center(col: Col, instant = false) {
  nextTick(() => {
    const el = lists.value[col]
    const on = el?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (el && on) el.scrollTo({ top: on.offsetTop - el.clientHeight / 2 + on.clientHeight / 2, behavior: instant ? 'auto' : 'smooth' })
  })
}
// Open on the chosen values straight away (a smooth scroll here was cut
// short by moving focus into the hour column, leaving the hour off-centre)
onMounted(() => {
  ;(['hour', 'minute', 'period'] as Col[]).forEach(c => center(c, true))
  nextTick(() => lists.value.hour?.focus({ preventScroll: true }))
})
// Scrolling by hand (trackpad, touch): pick the value that stops in the middle
const scrollTimers: Partial<Record<Col, ReturnType<typeof setTimeout>>> = {}
function onScroll(col: Col) {
  clearTimeout(scrollTimers[col])
  scrollTimers[col] = setTimeout(() => {
    const el = lists.value[col]
    if (!el) return
    const i = Math.max(0, Math.min(cols[col].length - 1, Math.round(el.scrollTop / 40)))
    if (model[col].value !== cols[col][i]) model[col].value = cols[col][i]!
  }, 120)
}
const label = (col: Col, v: number | string) => (col === 'minute' ? pad(v as number) : String(v))
const names: Record<Col, string> = { hour: 'Hour', minute: 'Minutes', period: 'AM or PM' }
</script>

<template>
  <div class="host-pop host-time" role="dialog" aria-label="Select Time" @keydown.esc.stop.prevent="emit('close')">
    <p class="host-pop__title text-app-body-semibold">Select Time</p>
    <div class="host-time__cols">
      <template v-for="col in (['hour', 'minute', 'period'] as Col[])" :key="col">
        <span v-if="col === 'minute'" class="host-time__colon text-app-body-semibold" aria-hidden="true">:</span>
        <ul
          :ref="el => (lists[col] = el as HTMLElement | null)"
          class="host-time__col"
          role="listbox"
          tabindex="0"
          :aria-label="names[col]"
          :aria-activedescendant="`host-time-${col}-${model[col].value}`"
          @keydown="onKey(col, $event)"
          @wheel="onWheel(col, $event)"
          @scroll="onScroll(col)"
        >
          <li class="host-time__spacer" aria-hidden="true" />
          <li
            v-for="v in cols[col]"
            :id="`host-time-${col}-${v}`"
            :key="v"
            role="option"
            :aria-selected="model[col].value === v"
            :class="['host-time__item', model[col].value === v ? 'host-time__item--on text-app-body-semibold' : 'text-app-small-regular']"
            @click="model[col].value = v; center(col)"
          >{{ label(col, v) }}</li>
          <li class="host-time__spacer" aria-hidden="true" />
        </ul>
      </template>
    </div>
    <UiButton class="host-time__save" @click="save">Save</UiButton>
  </div>
</template>

<style scoped>
.host-time { width: 336px; }
.host-time__cols { position: relative; display: flex; align-items: stretch; gap: var(--spacing-xs); }
/* The two lines around the chosen row */
.host-time__cols::before, .host-time__cols::after {
  content: ''; position: absolute; left: 0; right: 0; height: 1px; background: var(--color-border-default); pointer-events: none;
}
.host-time__cols::before { top: calc(50% - 20px); }
.host-time__cols::after { top: calc(50% + 20px); }
.host-time__colon { align-self: center; color: var(--color-action-primary); font-weight: var(--font-weight-bold); }
.host-time__col {
  flex: 1;
  height: 200px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  border-radius: var(--radius-md);
  outline: none;
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent);
          mask-image: linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent);
}
.host-time__col::-webkit-scrollbar { display: none; }
.host-time__col:focus-visible { box-shadow: inset 0 0 0 var(--focus-ring-width) var(--focus-ring-color); -webkit-mask-image: none; mask-image: none; }
.host-time__spacer { height: 80px; }
.host-time__item {
  display: flex; align-items: center; justify-content: center;
  height: 40px;
  color: var(--color-text-disabled);
  scroll-snap-align: center;
  cursor: pointer;
  user-select: none;
}
.host-time__item:hover { color: var(--color-text-muted); }
.host-time__item--on, .host-time__item--on:hover { color: var(--color-action-primary); font-weight: var(--font-weight-bold); }
.host-time__save.ui-button { width: 100%; }
</style>
