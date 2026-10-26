<script setup lang="ts">
import './styles.css'
/**
 * Date & Time (Figma frames 07 / 08, and the edition "Edit date & time"
 * dialog).
 * Step page: two fields side by side, 16 apart. Each: white, 0.5px Grey_4
 * line, radius 12, 14 / 16 padding; 20px calendar-03 / clock-01 icon,
 * value Body app semibold 16/24 ("21-05-2025", "05:00 PM"), 12px arrow.
 * Dialog (`stacked`, edition frame 05): "Date" and "Time" labels, fields
 * stacked 16 apart, 48px tall, 1px Grey_4 line, 18px Linear Calendar /
 * Clock Circle icons, value Small app regular 14/20 #141316.
 * Clicking a field opens our own pop-up (in the dialog it opens inside the
 * card, under the field) (HostDatePicker / HostTimePicker,
 * decision 24 Oct) instead of the browser's. Past days can't be picked.
 * Past time (frame 08): the time field turns red and "You cannot choose a
 * past time." shows under it (red, Small app regular).
 */
const props = withDefaults(defineProps<{ stacked?: boolean; label?: string }>(), { stacked: false, label: 'Date & Time' })
const date = defineModel<string>('date', { required: true })
const time = defineModel<string>('time', { required: true })

const id = useId()
const open = ref<'date' | 'time' | null>(null)
const root = ref<HTMLElement | null>(null)
const dateBtn = ref<HTMLButtonElement | null>(null)
const timeBtn = ref<HTMLButtonElement | null>(null)

const dateText = computed(() => {
  if (!date.value) return ''
  const [y, m, d] = date.value.split('-')
  return `${d}-${m}-${y}`
})
const timeText = computed(() => {
  if (!time.value) return ''
  const [hh, mm] = time.value.split(':').map(Number)
  const h12 = ((hh ?? 0) % 12) || 12
  return `${String(h12).padStart(2, '0')}:${String(mm ?? 0).padStart(2, '0')} ${(hh ?? 0) < 12 ? 'AM' : 'PM'}`
})
const isPast = computed(() => !!date.value && !!time.value && new Date(`${date.value}T${time.value}:00`).getTime() < Date.now())
defineExpose({ isPast })

function toggle(which: 'date' | 'time') { open.value = open.value === which ? null : which }
function close(returnFocus = true) {
  const was = open.value
  open.value = null
  if (returnFocus) nextTick(() => (was === 'date' ? dateBtn.value : timeBtn.value)?.focus())
}
// Click outside closes the pop-up
function onDocDown(e: PointerEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) close(false)
}
onMounted(() => document.addEventListener('pointerdown', onDocDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocDown))

const icons = computed(() => props.stacked
  ? { date: '/images/host/icon-calendar-18.svg', time: '/images/host/icon-clock-18.svg', size: 18 }
  : { date: '/images/host/icon-calendar-20.svg', time: '/images/host/icon-clock-20.svg', size: 20 })
</script>

<template>
  <div ref="root" :class="['host-dt', { 'host-dt--stacked': stacked }]">
    <span v-if="!stacked" :id="`${id}-label`" class="host-field__label host-dt__label text-app-small-semibold">{{ label }}</span>
    <div class="host-dt__row">
      <div class="host-field host-dt__col">
        <span v-if="stacked" :id="`${id}-dl`" class="host-field__label text-app-small-semibold">Date</span>
        <div class="host-dt__anchor">
          <button
            ref="dateBtn"
            type="button"
            :class="['host-dt__box', { 'host-dt__box--open': open === 'date' }]"
            :aria-labelledby="stacked ? `${id}-dl ${id}-dv` : undefined"
            :aria-label="stacked ? undefined : `Date, ${dateText || 'not set'}`"
            aria-haspopup="dialog"
            :aria-expanded="open === 'date'"
            @click="toggle('date')"
          >
            <img :src="icons.date" alt="" :width="icons.size" :height="icons.size" />
            <span :id="`${id}-dv`" :class="['host-dt__value', stacked ? 'text-app-small-regular' : 'text-app-body-semibold', { 'host-dt__value--empty': !dateText }]">{{ dateText || 'DD-MM-YYYY' }}</span>
            <img :class="['host-dt__arrow', { 'host-dt__arrow--up': open === 'date' }]" src="/images/host/icon-arrow-down-12.svg" alt="" width="12" height="12" />
          </button>
          <HostDatePicker v-if="open === 'date'" v-model="date" @close="close()" />
        </div>
      </div>
      <div class="host-field host-dt__col">
        <span v-if="stacked" :id="`${id}-tl`" class="host-field__label text-app-small-semibold">Time</span>
        <div class="host-dt__anchor">
          <button
            ref="timeBtn"
            type="button"
            :class="['host-dt__box', { 'host-dt__box--error': isPast, 'host-dt__box--open': open === 'time' }]"
            :aria-labelledby="stacked ? `${id}-tl ${id}-tv` : undefined"
            :aria-label="stacked ? undefined : `Time, ${timeText || 'not set'}`"
            aria-haspopup="dialog"
            :aria-expanded="open === 'time'"
            :aria-invalid="isPast ? 'true' : undefined"
            :aria-describedby="isPast ? `${id}-err` : undefined"
            @click="toggle('time')"
          >
            <img :src="icons.time" alt="" :width="icons.size" :height="icons.size" />
            <span :id="`${id}-tv`" :class="['host-dt__value', stacked ? 'text-app-small-regular' : 'text-app-body-semibold', { 'host-dt__value--empty': !timeText }]">{{ timeText || '--:-- --' }}</span>
            <img :class="['host-dt__arrow', { 'host-dt__arrow--up': open === 'time' }]" src="/images/host/icon-arrow-down-12.svg" alt="" width="12" height="12" />
          </button>
          <HostTimePicker v-if="open === 'time'" v-model="time" :class="{ 'host-dt__pop--end': !stacked }" @close="close()" />
        </div>
        <p v-if="isPast" :id="`${id}-err`" class="host-dt__error text-app-small-regular" role="alert">You cannot choose a past time.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.host-dt { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.host-dt__label { color: var(--color-text-checkout); }
.host-dt__row { display: flex; gap: var(--spacing-md); align-items: flex-start; }
.host-dt--stacked .host-dt__row { flex-direction: column; }
.host-dt__col { flex: 1 1 0; width: 100%; }
.host-dt__anchor { position: relative; }
.host-dt__box {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
  padding: calc(var(--spacing-field) - 0.5px) calc(var(--spacing-md) - 0.5px);
  border: 0.5px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-background-primary);
  font-family: var(--font-family-base);
  text-align: left;
  cursor: pointer;
  transition: border-color 150ms ease;
}
.host-dt__box:hover { border-color: var(--color-text-muted); }
.host-dt__box:focus-visible, .host-dt__box--open { outline: none; border-color: var(--color-border-focus); box-shadow: 0 0 0 0.5px var(--color-border-focus); }
.host-dt__box--error, .host-dt__box--error:hover { border-color: var(--color-host-danger); }
.host-dt--stacked .host-dt__box {
  min-height: var(--sizing-control-standard);
  padding: calc(var(--spacing-field) - 1px) calc(var(--spacing-md) - 1px);
  border-width: var(--border-width-default);
}
.host-dt__value { flex: 1; color: var(--color-text-option); }
.host-dt--stacked .host-dt__value { color: var(--color-text-checkout); }
.host-dt__value--empty { color: var(--color-text-placeholder-subtle); font-weight: var(--font-weight-regular); }
.host-dt__arrow { flex: none; transition: transform 150ms ease; }
.host-dt__arrow--up { transform: scaleY(-1); }
.host-dt__error { margin: 0; color: var(--color-host-danger); }
/* In the dialog the card clips its content, so the pickers open inside the
   card, under their field, and push the buttons down */
.host-dt--stacked .host-dt__anchor :deep(.host-pop) { position: static; width: 100%; margin-top: var(--spacing-xs); box-shadow: none; border-color: var(--color-border-default); }
/* The time pop-up lines up with the right edge of its field on the step page */
.host-dt__anchor :deep(.host-dt__pop--end) { left: auto; right: 0; }
/* Phones (Figma mobile Ticket Details 10754:71374): the two fields stack
   8 apart under the step's own collapsible "Date & Time" heading */
@media (max-width: 767px) {
  .host-dt:not(.host-dt--stacked) .host-dt__label { display: none; }
  .host-dt:not(.host-dt--stacked) .host-dt__row { flex-direction: column; gap: var(--spacing-xs); }
  .host-dt__anchor :deep(.host-dt__pop--end) { left: 0; right: auto; }
  .host-dt__anchor :deep(.host-pop) { max-width: calc(100vw - 2 * var(--spacing-lg)); }
}
@media (prefers-reduced-motion: reduce) { .host-dt__arrow { transition: none; } }
</style>
