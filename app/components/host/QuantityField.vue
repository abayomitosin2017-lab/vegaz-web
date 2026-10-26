<script setup lang="ts">
import './styles.css'
/**
 * "Ticket Quantity" (Figma frames 10-15, redesigned by design 23 Oct).
 * Label row: "Ticket Quantity" + "Unlimited Slot" checkbox (16px square,
 * Small app semibold Grey_3; Primary filled square and black text when on).
 * Stepper: Grey_6 box, 0.5px Grey_5, radius 16, 8 padding, 24 apart;
 * 32px minus / add circles; white number box in the middle (1px #E5E7EF,
 * radius 12, 8 / 16 padding), number Body web bold 18/28.
 * While "Unlimited Slot" is on, the stepper is turned off (not drawn: it
 * fades to 50%). The number can also be typed.
 */
const props = withDefaults(defineProps<{ label?: string; min?: number; max?: number }>(), { label: 'Ticket Quantity', min: 1, max: 100000 })
const quantity = defineModel<number>('quantity', { required: true })
const unlimited = defineModel<boolean>('unlimited', { required: true })
const id = useId()

function set(n: number) {
  if (!Number.isFinite(n)) return
  quantity.value = Math.max(props.min, Math.min(props.max, Math.round(n)))
}
function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const n = Number(el.value.replace(/\D/g, ''))
  if (el.value === '') return
  set(n)
  el.value = String(quantity.value)
}
</script>

<template>
  <div class="host-field host-qty">
    <div class="host-field__label-row">
      <label :for="`${id}-n`" class="host-field__label text-app-small-semibold">{{ label }}</label>
      <label :class="['host-qty__unlimited text-app-small-semibold', { 'host-qty__unlimited--on': unlimited }]">
        <input v-model="unlimited" class="host-visually-hidden" type="checkbox" />
        <img :src="unlimited ? '/images/host/icon-square-on-16.svg' : '/images/host/icon-square-16.svg'" alt="" width="16" height="16" />
        Unlimited Slot
      </label>
    </div>
    <div :class="['host-qty__stepper', { 'host-qty__stepper--off': unlimited }]">
      <button type="button" class="host-qty__btn" :disabled="unlimited || quantity <= min" :aria-label="`Fewer (${label})`" @click="set(quantity - 1)">
        <img class="host-qty__icon-web" :src="quantity > min && !unlimited ? '/images/host/icon-minus-circle-on-32.svg' : '/images/host/icon-minus-circle-32.svg'" alt="" width="32" height="32" />
        <img class="host-qty__icon-phone" src="/images/host/m-minus-24.svg" alt="" width="24" height="24" />
      </button>
      <input
        :id="`${id}-n`"
        class="host-qty__value text-body-bold"
        type="text"
        inputmode="numeric"
        :value="quantity"
        :disabled="unlimited"
        @change="onInput"
        @keydown.up.prevent="set(quantity + 1)"
        @keydown.down.prevent="set(quantity - 1)"
      />
      <button type="button" class="host-qty__btn" :disabled="unlimited || quantity >= max" :aria-label="`More (${label})`" @click="set(quantity + 1)">
        <img class="host-qty__icon-web" :src="quantity < max && !unlimited ? '/images/host/icon-add-circle-32.svg' : '/images/host/icon-add-circle-off-32.svg'" alt="" width="32" height="32" />
        <img class="host-qty__icon-phone" src="/images/host/m-plus-24.svg" alt="" width="24" height="24" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.host-qty__unlimited { display: inline-flex; align-items: center; gap: var(--spacing-xs); color: var(--color-text-muted); cursor: pointer; border-radius: var(--radius-xs); }
.host-qty__unlimited--on { color: var(--color-text-primary); }
.host-qty__unlimited:has(input:focus-visible) { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.host-qty__stepper {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: calc(var(--spacing-xs) - 0.5px);
  border: 0.5px solid var(--color-border-default);
  border-radius: 16px;
  background: var(--color-background-secondary);
  transition: opacity 150ms ease;
}
.host-qty__stepper--off { opacity: 0.5; }
.host-qty__btn { display: inline-flex; flex: none; padding: 0; border: 0; border-radius: 50%; background: none; cursor: pointer; }
.host-qty__btn:disabled { cursor: default; }
.host-qty__btn:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.host-qty__value {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  padding: calc(var(--spacing-xs) - 1px) calc(var(--spacing-md) - 1px);
  border: var(--border-width-default) solid var(--color-host-field-border);
  border-radius: var(--radius-md);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  text-align: center;
  outline: none;
}
.host-qty__value:focus { border-color: var(--color-border-focus); }
.host-qty__value:disabled { background: var(--color-background-primary); }

.host-qty__icon-phone { display: none; }
/* Phones (Figma mobile Create Ticket 10754:71510): #F4F5F8 box, radius 24,
   8 / 16 padding, 8 apart; 40px round buttons with a white 24px circle icon
   (minus Grey_4 when it can't go lower, plus Primary); white number box
   (1px #E5E7EF, radius 12, 14 / 16 padding), number Headline 3 semibold 20/26 */
@media (max-width: 767px) {
  .host-qty__icon-web { display: none; }
  .host-qty__icon-phone { display: block; }
  .host-qty__stepper { gap: var(--spacing-xs); padding: var(--spacing-xs) var(--spacing-md); border: 0; border-radius: var(--radius-lg); background: var(--color-host-empty); }
  .host-qty__btn { padding: calc(var(--spacing-xs) - 0.5px); border: 0.5px solid rgba(75, 9, 159, 0.1); border-radius: var(--radius-pill); background: var(--color-action-primary); }
  .host-qty__btn:disabled { background: var(--color-border-strong); }
  .host-qty__value { padding: calc(var(--spacing-field) - 1px) calc(var(--spacing-md) - 1px); font-size: 20px; line-height: 26px; font-weight: var(--font-weight-semibold); color: var(--color-text-checkout); }
}
</style>
