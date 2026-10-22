<script setup lang="ts">
/**
 * UiTextField: labelled text field from the Figma onboarding modals
 * (a different input style from UiInput: 14/16px padding, semibold text,
 * Grey_4 placeholder).
 *
 * States from Figma: default; `success` (green border + green tick, e.g. an
 * available username). Focus uses the approved purple focus border.
 * Text: Small semibold (14/20 below 1024px, 16/24 from 1024px).
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    type?: 'text' | 'email' | 'tel'
    success?: boolean
    /** Screen-reader text announced with the green tick */
    successLabel?: string
  }>(),
  { modelValue: '', label: undefined, placeholder: undefined, type: 'text', success: false, successLabel: 'Available' },
)
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const id = useId()
const attrs = useAttrs()
</script>

<template>
  <div class="ui-field">
    <label v-if="label" :for="id" class="ui-field__label text-small-semibold">{{ label }}</label>
    <div :class="['ui-field__box', { 'ui-field__box--success': success }]">
      <input
        :id="id"
        v-bind="attrs"
        class="ui-field__input text-small-semibold"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <img v-if="success" class="ui-field__tick" src="/images/auth/icon-tick-circle.svg" alt="" width="24" height="24" />
      <span v-if="success" class="ui-field__sr">{{ successLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.ui-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
  min-width: 0;
}
.ui-field__label { color: var(--color-text-field); }
.ui-field__box {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
  /* Figma: 14px / 16px padding, 1px #E5E7EF border inside, radius 12 */
  padding: calc(var(--spacing-field) - var(--border-width-default)) calc(var(--spacing-md) - var(--border-width-default));
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-background-primary);
  transition: border-color 150ms ease;
}
.ui-field__box:focus-within { border-color: var(--color-border-focus); }
.ui-field__box--success,
.ui-field__box--success:focus-within { border-color: var(--color-border-success); }
.ui-field__input {
  flex: 1;
  width: 0; /* let the field shrink to its column; native inputs have a wide default */
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text-field);
}
.ui-field__input::placeholder { color: var(--color-text-placeholder-subtle); opacity: 1; }
/* Figma: the 24px tick sits in the field row, so on mobile (20px text line)
   the field grows by 4px while the tick shows */
.ui-field__tick { flex: none; width: var(--sizing-icon-standard); height: var(--sizing-icon-standard); }
.ui-field__sr {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
/* Phones: input text 16px (token text-input-mobile, decision 21 Oct) */
@media (max-width: 767px) {
  .ui-field__input {
    font-size: var(--text-input-mobile-size);
    line-height: var(--text-input-mobile-line);
    letter-spacing: var(--text-input-mobile-tracking);
  }
}
@media (prefers-reduced-motion: reduce) { .ui-field__box { transition: none; } }
</style>
