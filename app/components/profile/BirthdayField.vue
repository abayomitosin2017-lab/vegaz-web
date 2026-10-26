<script setup lang="ts">
import './styles.css'
/**
 * Birthday field (Figma: Edit Profile "Birthday" and the birthday prompt).
 * Pill: 1px Grey_5 line, radius 40, padding 8 / 8 / 8 / 16, white. Value
 * "24 - 06 - 2026" (Small regular #2C2C2C) or "00 - 00 - 0000" (Grey_3)
 * when empty; on the right a 36px Grey_6 circle with the 20px calendar.
 * Picking uses the browser's own date picker (quick to go back years for a
 * birthday; PROPOSED), so it works with touch, mouse and keyboard. Dates
 * after today can't be picked.
 */
const model = defineModel<string | undefined>({ required: true })
const props = defineProps<{ id: string; label?: string; labelledby?: string }>()
const input = ref<HTMLInputElement | null>(null)
const today = new Date()
const max = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const shown = computed(() => {
  const m = model.value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m ? `${m[3]} - ${m[2]} - ${m[1]}` : ''
})
function openPicker() {
  const el = input.value
  if (!el) return
  try { el.showPicker?.() } catch { el.focus() }
}
function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  model.value = v && v <= max ? v : v ? max : undefined
}
</script>

<template>
  <div class="profile-bday" @click="openPicker">
    <span :class="['profile-bday__value text-app-small-regular', { 'profile-bday__value--empty': !shown }]" aria-hidden="true">{{ shown || '00 - 00 - 0000' }}</span>
    <span class="profile-bday__btn" aria-hidden="true"><img src="/images/profile/icon-calendar-20.svg" alt="" width="16" height="16" /></span>
    <input
      :id="props.id"
      ref="input"
      class="profile-bday__input"
      type="date"
      min="1900-01-01"
      :max="max"
      :value="model ?? ''"
      :aria-label="props.labelledby ? undefined : (props.label ?? 'Birthday')"
      :aria-labelledby="props.labelledby"
      @input="onInput"
      @change="onInput"
    />
  </div>
</template>

<style scoped>
.profile-bday {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: var(--sizing-control-field);
  padding: 7px 7px 7px 15px; /* 8 / 8 / 8 / 16 inside the 1px line */
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-pill);
  background: var(--color-background-primary);
  cursor: pointer;
  transition: border-color 150ms ease;
}
.profile-bday:hover { border-color: var(--color-border-strong); }
.profile-bday:focus-within { border-color: var(--color-action-primary); }
.profile-bday__value { color: var(--color-text-primary); }
.profile-bday__value--empty { color: var(--color-text-placeholder); }
.profile-bday__btn { display: inline-flex; padding: var(--spacing-xs); border-radius: var(--radius-pill); background: var(--color-background-secondary); }
/* The real date input covers the field (invisible), so typing and the picker both work */
.profile-bday__input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 0; border: 0; opacity: 0; cursor: pointer; font-size: 16px; }
.profile-bday__input::-webkit-calendar-picker-indicator { position: absolute; inset: 0; width: 100%; height: 100%; cursor: pointer; opacity: 0; }
</style>
