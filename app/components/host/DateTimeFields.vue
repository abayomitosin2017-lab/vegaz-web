<script setup lang="ts">
import './styles.css'
/**
 * Date & Time (Figma frames 07 / 08, and the edition "Edit date & time"
 * dialog). Two fields side by side, 16 apart (stacked with their own
 * "Date" / "Time" labels in the dialog). Each: white, 0.5px Grey_4
 * border, radius 12, 14 / 16 padding; 20px calendar / clock icon, value
 * Body app semibold 16/24 ("21-05-2025", "05:00 PM"), 12px arrow.
 * The browser's own date and time pickers open on click.
 * Past time (frame 08): the time field border turns red and "You cannot
 * choose a past time." shows under it (red, Small app regular).
 */
const props = withDefaults(defineProps<{ stacked?: boolean; label?: string }>(), { stacked: false, label: 'Date & Time' })
const date = defineModel<string>('date', { required: true })
const time = defineModel<string>('time', { required: true })

const id = useId()
const dateInput = ref<HTMLInputElement | null>(null)
const timeInput = ref<HTMLInputElement | null>(null)

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

/** True when the chosen date and time are already over */
const isPast = computed(() => {
  if (!date.value || !time.value) return false
  return new Date(`${date.value}T${time.value}:00`).getTime() < Date.now()
})
defineExpose({ isPast })

function open(el: HTMLInputElement | null) {
  try { el?.showPicker() } catch { el?.focus() }
}
const today = new Date().toISOString().slice(0, 10)
</script>

<template>
  <div :class="['host-dt', { 'host-dt--stacked': stacked }]">
    <span v-if="!stacked" :id="`${id}-label`" class="host-field__label host-dt__label text-app-small-semibold">{{ label }}</span>
    <div class="host-dt__row">
      <div class="host-field host-dt__col">
        <label v-if="stacked" :for="`${id}-d`" class="host-field__label text-app-small-semibold">Date</label>
        <div class="host-dt__box" @click="open(dateInput)">
          <img src="/images/host/icon-calendar-20.svg" alt="" width="20" height="20" />
          <span :class="['host-dt__value text-app-body-semibold', { 'host-dt__value--empty': !dateText }]" aria-hidden="true">{{ dateText || 'DD-MM-YYYY' }}</span>
          <img src="/images/host/icon-arrow-down-12.svg" alt="" width="12" height="12" />
          <input :id="`${id}-d`" ref="dateInput" v-model="date" class="host-dt__native" type="date" :min="today" :aria-label="stacked ? undefined : 'Date'" />
        </div>
      </div>
      <div class="host-field host-dt__col">
        <label v-if="stacked" :for="`${id}-t`" class="host-field__label text-app-small-semibold">Time</label>
        <div :class="['host-dt__box', { 'host-dt__box--error': isPast }]" @click="open(timeInput)">
          <img src="/images/host/icon-clock-20.svg" alt="" width="20" height="20" />
          <span :class="['host-dt__value text-app-body-semibold', { 'host-dt__value--empty': !timeText }]" aria-hidden="true">{{ timeText || '--:-- --' }}</span>
          <img src="/images/host/icon-arrow-down-12.svg" alt="" width="12" height="12" />
          <input :id="`${id}-t`" ref="timeInput" v-model="time" class="host-dt__native" type="time" :aria-label="stacked ? undefined : 'Time'" :aria-invalid="isPast ? 'true' : undefined" :aria-describedby="isPast ? `${id}-err` : undefined" />
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
.host-dt--stacked .host-dt__row { flex-direction: column; gap: var(--spacing-md); }
.host-dt__col { flex: 1 1 0; width: 100%; }
.host-dt__box {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: calc(var(--spacing-field) - 0.5px) calc(var(--spacing-md) - 0.5px);
  border: 0.5px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-background-primary);
  cursor: pointer;
  transition: border-color 150ms ease;
}
.host-dt__box:hover { border-color: var(--color-text-muted); }
.host-dt__box:focus-within { border-color: var(--color-border-focus); box-shadow: 0 0 0 0.5px var(--color-border-focus); }
.host-dt__box--error, .host-dt__box--error:hover { border-color: var(--color-host-danger); }
.host-dt__value { flex: 1; color: var(--color-text-option); }
.host-dt__value--empty { color: var(--color-text-placeholder-subtle); font-weight: var(--font-weight-regular); }
.host-dt__native { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: 0; padding: 0; }
.host-dt__native::-webkit-calendar-picker-indicator { position: absolute; inset: 0; width: 100%; height: 100%; cursor: pointer; }
.host-dt__error { margin: 0; color: var(--color-host-danger); }
</style>
