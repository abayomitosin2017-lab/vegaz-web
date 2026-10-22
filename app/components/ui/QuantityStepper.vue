<script setup lang="ts">
/**
 * UiQuantityStepper: the "- [ n ] +" control from the Figma ticket option
 * card (Component 13, node 9832:32993).
 *
 * - The number is display-only; it changes with the - and + buttons.
 * - "-" stops at `min` (default 0). Figma shows "-" grey in every state, so
 *   it looks the same when it cannot go lower.
 * - "+" stops at `max` (when given) and switches to the grey "+" icon,
 *   as on the "5 ticket left" card.
 * - `unavailable` (sold out): the box stays, its contents are hidden and it
 *   cannot be used, as on the "Sold out" card.
 * No business rules here: limits come from the parent (ticket data/API).
 */
const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    unavailable?: boolean
    /** What is being counted, for screen readers, e.g. "VIP TABLE tickets" */
    label: string
  }>(),
  { min: 0, max: undefined, unavailable: false },
)
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const canDecrease = computed(() => !props.unavailable && props.modelValue > props.min)
const atMax = computed(() => props.max !== undefined && props.modelValue >= props.max)
const canIncrease = computed(() => !props.unavailable && !atMax.value)

function change(step: number) {
  const next = props.modelValue + step
  const upper = props.max ?? Number.POSITIVE_INFINITY
  emit('update:modelValue', Math.min(upper, Math.max(props.min, next)))
}
</script>

<template>
  <div
    :class="['ui-stepper', { 'ui-stepper--unavailable': unavailable }]"
    role="group"
    :aria-label="label"
    :data-min="min"
    :data-max="max"
    :aria-hidden="unavailable ? 'true' : undefined"
  >
    <button
      type="button"
      class="ui-stepper__button"
      :disabled="!canDecrease"
      :aria-label="`Remove one from ${label}`"
      @click="change(-1)"
    >
      <img src="/images/icon-minus-circle.svg" alt="" width="32" height="32" />
    </button>
    <output class="ui-stepper__value" aria-live="polite">{{ modelValue }}</output>
    <button
      type="button"
      class="ui-stepper__button"
      :disabled="!canIncrease"
      :aria-label="`Add one to ${label}`"
      @click="change(1)"
    >
      <img
        :src="atMax || unavailable ? '/images/icon-add-circle-disabled.svg' : '/images/icon-add-circle.svg'"
        alt=""
        width="32"
        height="32"
      />
    </button>
  </div>
</template>

<style scoped>
.ui-stepper {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--spacing-xs);
  width: 158px;
  /* Figma: 8px padding; 0.5px Grey_5 hairline border drawn inside (overlay,
     so it never changes the size on any screen density) */
  position: relative;
  padding: var(--spacing-xs);
  border-radius: var(--spacing-md); /* Figma radius 16: no radius token */
  background: var(--color-background-secondary);
}
.ui-stepper::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 0.5px solid var(--color-border-default);
  border-radius: inherit;
  pointer-events: none;
}

.ui-stepper__button {
  display: inline-flex;
  flex: none;
  width: var(--spacing-xl);
  height: var(--spacing-xl);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}
.ui-stepper__button img { width: var(--spacing-xl); height: var(--spacing-xl); }
.ui-stepper__button:disabled { cursor: not-allowed; }
.ui-stepper__button:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

.ui-stepper__value {
  display: flex;
  flex: 1 0 0;
  align-items: center;
  justify-content: center;
  min-width: 0;
  /* Figma: 8px / 16px padding, 1px Grey_5 border inside, radius 12 (42px tall) */
  padding: calc(var(--spacing-xs) - var(--border-width-default)) calc(var(--spacing-md) - var(--border-width-default));
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-app-h3-semibold-size);
  line-height: var(--text-app-h3-semibold-line);
  letter-spacing: var(--text-app-h3-semibold-tracking);
  white-space: nowrap;
}

/* Sold out: same box, nothing inside (Figma hides the number and icons) */
.ui-stepper--unavailable > * { visibility: hidden; }
</style>
