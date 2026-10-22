<script setup lang="ts">
/**
 * UiCodeInput: 6-box verification code from the Figma "Enter Code" modal.
 *
 * - One digit per box; typing moves to the next box, Backspace on an empty
 *   box moves back, arrow keys move between boxes, pasting a code fills all.
 * - Empty boxes show "-" (Figma). Text: Body semibold (16/24 below 1024px,
 *   18/28 from 1024px).
 * - `error`: Negative light_3 fill + Negative border on every box, and the
 *   digits switch to Small semibold (16/24 desktop, 14/20 mobile), exactly as
 *   Figma. FLAG: this makes the boxes 4px shorter in the error state.
 * Emits `complete` when all boxes are filled.
 */
const props = withDefaults(
  defineProps<{ modelValue?: string; length?: number; error?: boolean; label?: string }>(),
  { modelValue: '', length: 6, error: false, label: 'Verification code' },
)
const emit = defineEmits<{ 'update:modelValue': [value: string]; complete: [value: string] }>()

const boxes = ref<HTMLInputElement[]>([])
const digits = computed(() => Array.from({ length: props.length }, (_, i) => props.modelValue[i] ?? ''))

function setValue(next: string) {
  const clean = next.replace(/\D/g, '').slice(0, props.length)
  emit('update:modelValue', clean)
  if (clean.length === props.length) emit('complete', clean)
}

function focusBox(i: number) {
  const el = boxes.value[Math.max(0, Math.min(props.length - 1, i))]
  el?.focus()
  el?.select()
}
/** Move focus after the parent has applied the new value (keeps the no-gap rule correct) */
async function focusBoxAfterUpdate(i: number) {
  await nextTick()
  focusBox(i)
}

function onInput(i: number, e: Event) {
  const input = e.target as HTMLInputElement
  const typed = input.value.replace(/\D/g, '')
  if (!typed) { input.value = digits.value[i] ?? ''; return }
  if (typed.length > 1) { // paste or autofill into one box
    setValue((props.modelValue.slice(0, i) + typed).slice(0, props.length))
    focusBoxAfterUpdate(i + typed.length)
    return
  }
  const arr = digits.value.slice()
  arr[i] = typed
  setValue(arr.join(''))
  input.value = typed
  focusBoxAfterUpdate(i + 1)
}

function onKeydown(i: number, e: KeyboardEvent) {
  if (e.key === 'Backspace') {
    e.preventDefault()
    const arr = digits.value.slice()
    if (arr[i]) { arr[i] = ''; setValue(arr.join('')) }
    else if (i > 0) { arr[i - 1] = ''; setValue(arr.join('')); focusBoxAfterUpdate(i - 1) }
  } else if (e.key === 'ArrowLeft') { e.preventDefault(); focusBox(i - 1) }
  else if (e.key === 'ArrowRight') { e.preventDefault(); focusBox(i + 1) }
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text') ?? ''
  if (!/\d/.test(text)) return
  e.preventDefault()
  setValue(text)
  focusBoxAfterUpdate(text.replace(/\D/g, '').length)
}

/** First empty box gets focus when clicked anywhere after it (no gaps) */
function onFocus(i: number) {
  const firstEmpty = digits.value.findIndex(d => !d)
  if (firstEmpty !== -1 && i > firstEmpty) focusBox(firstEmpty)
  else boxes.value[i]?.select()
}

defineExpose({ focus: () => focusBox(digits.value.findIndex(d => !d) === -1 ? props.length - 1 : digits.value.findIndex(d => !d)) })
</script>

<template>
  <div class="ui-code" role="group" :aria-label="label">
    <input
      v-for="(d, i) in digits"
      :key="i"
      :ref="el => { if (el) boxes[i] = el as HTMLInputElement }"
      :class="['ui-code__box', 'text-body-semibold', { 'ui-code__box--error': error }]"
      :value="d"
      inputmode="numeric"
      :autocomplete="i === 0 ? 'one-time-code' : 'off'"
      :maxlength="i === 0 ? length : 1"
      placeholder="-"
      :aria-label="`Digit ${i + 1} of ${length}`"
      :aria-invalid="error ? 'true' : undefined"
      :data-autofocus="i === 0 ? '' : undefined"
      @input="onInput(i, $event)"
      @keydown="onKeydown(i, $event)"
      @paste="onPaste"
      @focus="onFocus(i)"
    />
  </div>
</template>

<style scoped>
.ui-code {
  display: flex;
  gap: var(--spacing-xs);
  width: 100%;
}
.ui-code__box {
  flex: 1 0 0;
  min-width: 0;
  /* Figma: 14px / 16px padding, 1px #E5E7EF border inside, radius 12 */
  padding: calc(var(--spacing-field) - var(--border-width-default)) 0;
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-background-primary);
  color: var(--color-text-field);
  text-align: center;
  outline: 0;
  transition: border-color 150ms ease, background-color 150ms ease;
}
.ui-code__box::placeholder { color: var(--color-text-field); opacity: 1; }
.ui-code__box:focus { border-color: var(--color-border-focus); }
.ui-code__box:focus::placeholder { color: transparent; }
.ui-code__box--error,
.ui-code__box--error:focus {
  border-color: var(--color-status-error);
  background: var(--color-background-error);
  font-size: var(--text-small-semibold-size);
  line-height: var(--text-small-semibold-line);
  letter-spacing: var(--text-small-semibold-tracking);
}
/* Phones: input text 16px (token text-input-mobile, decision 21 Oct) */
@media (max-width: 767px) {
  .ui-code__box {
    font-size: var(--text-input-mobile-size);
    line-height: var(--text-input-mobile-line);
    letter-spacing: var(--text-input-mobile-tracking);
  }
}
@media (prefers-reduced-motion: reduce) { .ui-code__box { transition: none; } }
</style>
