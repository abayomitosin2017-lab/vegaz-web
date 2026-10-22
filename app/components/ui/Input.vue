<script setup lang="ts">
/**
 * UiInput: from Figma component set "input" (node 49:2771), standard style.
 *
 * Figma axis          -> API
 *   left icon         -> #icon slot (20px)
 *   password          -> type="password" (built-in show/hide button, #toggle-icon slot)
 *   right icon        -> #action slot: purple round button; makes the field a pill (search style)
 *   error             -> error prop
 *   focus             -> automatic (:focus-within)
 *   placeholder       -> placeholder prop
 *   dark              -> not built
 * NOT built yet: "small" and "line" styles (not reviewed in Figma yet).
 * Figma has no label or message text on the input, so labelling is done with
 * aria-label, or an external <label for="id">. A FormField pattern comes later.
 * textStyle (not a Figma axis): 'app' (default) = Mobile App Small regular 14/20;
 *   'web' = Web Small regular, 14/20 below 1024px and 16/24 from 1024px
 *   (used by the header search field, which shows 16/24 in Figma).
 * filled (instance style seen in Figma "Search chats", chat 10669:50342):
 *   Grey_6 background, pill corners. Same 52px height and 16px padding.
 * Disabled styling is PROPOSED (not in Figma). Figma defines no hover state.
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'
    placeholder?: string
    error?: boolean
    disabled?: boolean
    actionLabel?: string
    showPasswordLabel?: string
    hidePasswordLabel?: string
    textStyle?: 'app' | 'web'
    filled?: boolean
  }>(),
  {
    modelValue: '',
    type: 'text',
    placeholder: undefined,
    error: false,
    disabled: false,
    actionLabel: undefined,
    showPasswordLabel: 'Show password',
    hidePasswordLabel: 'Hide password',
    textStyle: 'app',
    filled: false,
  },
)
const emit = defineEmits<{ 'update:modelValue': [value: string]; action: [] }>()

const attrs = useAttrs()
const slots = useSlots()
const wrapperAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const inputAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs
  return rest
})

const revealed = ref(false)
const isPassword = computed(() => props.type === 'password')
const nativeType = computed(() => (isPassword.value && revealed.value ? 'text' : props.type))
const isPill = computed(() => !!slots.action)

if (import.meta.dev) {
  if (!attrs['aria-label'] && !attrs['aria-labelledby'] && !attrs.id) {
    console.warn('[UiInput] Give the input an aria-label, or an id that matches an external <label for>.')
  }
  if (isPill.value && !props.actionLabel) {
    console.warn('[UiInput] The action button needs an actionLabel for screen readers.')
  }
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div
    v-bind="wrapperAttrs"
    :class="['ui-input', { 'ui-input--pill': isPill, 'ui-input--error': error, 'ui-input--disabled': disabled, 'ui-input--text-web': textStyle === 'web', 'ui-input--filled': filled }]"
  >
    <span v-if="$slots.icon" class="ui-input__icon" aria-hidden="true"><slot name="icon" /></span>
    <input
      v-bind="inputAttrs"
      class="ui-input__field"
      :type="nativeType"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      @input="onInput"
    />
    <button
      v-if="isPassword"
      type="button"
      class="ui-input__toggle"
      :aria-label="revealed ? hidePasswordLabel : showPasswordLabel"
      :aria-pressed="revealed"
      :disabled="disabled"
      @click="revealed = !revealed"
    >
      <slot name="toggle-icon" :revealed="revealed" />
    </button>
    <button
      v-if="isPill"
      type="button"
      class="ui-input__action"
      :aria-label="actionLabel"
      :disabled="disabled"
      @click="emit('action')"
    >
      <slot name="action" />
    </button>
  </div>
</template>

<style scoped>
.ui-input {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  min-height: var(--sizing-control-field);
  /* Figma strokes sit inside the frame, so padding is reduced by the border width */
  padding-inline: calc(var(--spacing-md) - var(--border-width-default));
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-background-primary);
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-regular);
  font-size: var(--text-app-small-regular-size);
  line-height: var(--text-app-small-regular-line);
  letter-spacing: var(--text-app-small-regular-tracking);
  transition: border-color 150ms ease; /* proposed */
}
.ui-input--text-web {
  font-size: var(--text-small-regular-size);
  line-height: var(--text-small-regular-line);
  letter-spacing: var(--text-small-regular-tracking);
}
.ui-input--pill {
  padding-block: calc(var(--spacing-xs) - var(--border-width-default));
  padding-inline: calc(var(--spacing-md) - var(--border-width-default)) calc(var(--spacing-xs) - var(--border-width-default));
  border-radius: var(--radius-pill);
}
.ui-input--filled {
  border-radius: var(--radius-pill);
  background: var(--color-background-secondary);
}
.ui-input:focus-within { border-color: var(--color-border-focus); }
.ui-input--error,
.ui-input--error:focus-within { border-color: var(--color-border-error); }

.ui-input__icon { display: inline-flex; width: 20px; height: 20px; flex: none; }
.ui-input__field {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
}
.ui-input__field::placeholder { color: var(--color-text-placeholder); opacity: 1; }
/* Clear (x) button the browser adds to search fields once you type.
   Design decision: Grey_1. Browsers do not let the built-in icon be recoloured,
   so it is replaced with the same 16px cross drawn as a mask in Grey_1.
   (Firefox shows no clear button on search fields.) */
.ui-input__field::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
  width: var(--spacing-md);
  height: var(--spacing-md);
  margin: 0;
  background-color: var(--color-text-strong);
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 4l8 8M12 4l-8 8' stroke='black' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 4l8 8M12 4l-8 8' stroke='black' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") center / contain no-repeat;
  cursor: pointer;
}

.ui-input__toggle {
  display: inline-flex;
  flex: none;
  width: var(--sizing-icon-standard);
  height: var(--sizing-icon-standard);
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.ui-input__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 36px;
  height: 36px;
  padding: var(--spacing-xs);
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-action-primary);
  color: var(--color-text-on-action-primary);
  cursor: pointer;
}
.ui-input__action:hover:not(:disabled) { background: var(--color-action-primary-hover); }   /* proposed */
.ui-input__action:active:not(:disabled) { background: var(--color-action-primary-pressed); } /* proposed */
.ui-input__toggle:focus-visible,
.ui-input__action:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* ---- disabled (proposed) ---- */
.ui-input--disabled {
  background: var(--color-background-disabled);
  border-color: var(--color-border-disabled);
  color: var(--color-text-disabled);
}
.ui-input--disabled .ui-input__field::placeholder { color: var(--color-text-disabled); }
.ui-input--disabled .ui-input__field,
.ui-input--disabled .ui-input__toggle { cursor: not-allowed; }
.ui-input__action:disabled { background: var(--color-text-disabled); cursor: not-allowed; }

/* Phones: input text 16px (token text-input-mobile, decision 21 Oct) */
@media (max-width: 767px) {
  .ui-input,
  .ui-input--text-web {
    font-size: var(--text-input-mobile-size);
    line-height: var(--text-input-mobile-line);
    letter-spacing: var(--text-input-mobile-tracking);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ui-input { transition: none; }
}
</style>
