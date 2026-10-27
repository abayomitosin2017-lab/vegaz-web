<script setup lang="ts">
/**
 * CheckoutSelect: the "Select Type" / "Select Tier" field with its list
 * (Figma "Add Ticket" 10715:61787 and "Add user" 10724:66844).
 *
 * Field: like UiTextField (14/16 padding, 1px Grey_5, radius 12), Small
 * semibold text, 16px chevron on the right that points up while open.
 * List (open): sits under the field, 8px below, pushing the buttons down
 * (Figma). White, 1px #F4F5F8 edge, radius 12, 16px padding, 0 4 12 shadow
 * at 10%; options 12px apart with a 1px Grey_5 line between.
 * Option: label Small semibold #141316 (+ chip), description x-Small regular
 * Grey_3, value on the right Small semibold Primary. Disabled options (sold
 * out): label and value Grey_3, description Grey_4; cannot be picked.
 * Chips: 'neutral' Grey_5 + Grey_1 semibold ("Sold out"); 'alert' red +
 * white regular ("5 tickets left").
 *
 * 'preset' (host an event, Figma frame 09): green 7% fill, 10% green
 * line, green x-Small regular ("Preset").
 *
 * variant 'host' (host an event "Ticket Type", Figma frames 07-14): label
 * raw black; placeholder Small app regular, chosen value Body app semibold
 * 16/24; 24px arrow; descriptions Small app regular 14/20; lines #F4F5F8;
 * the list sits right under the field (no gap). Not scrolled (5 items).
 *
 * Keyboard (listbox pattern, not drawn in Figma): Enter / Space / Down
 * opens the list; Up / Down move; Enter picks; Escape closes.
 */
export interface SelectOption {
  id: string
  label: string
  description?: string
  value?: string
  chip?: string
  chipTone?: 'neutral' | 'alert' | 'preset'
  disabled?: boolean
}

const props = withDefaults(defineProps<{ options: SelectOption[]; label: string; placeholder: string; variant?: 'checkout' | 'host' }>(), { variant: 'checkout' })
const model = defineModel<string | null>({ default: null })

const open = ref(false)
const active = ref(-1)
const id = useId()
const listId = `${id}-list`
const field = ref<HTMLButtonElement | null>(null)

const selected = computed(() => props.options.find(o => o.id === model.value))
const enabled = computed(() => props.options.map((o, i) => (o.disabled ? -1 : i)).filter(i => i >= 0))

function toggle() {
  open.value = !open.value
  if (open.value) active.value = Math.max(0, props.options.findIndex(o => o.id === model.value && !o.disabled), enabled.value[0] ?? -1)
}
function pick(o: SelectOption) {
  if (o.disabled) return
  model.value = o.id
  open.value = false
  field.value?.focus()
}
function move(dir: 1 | -1) {
  const list = enabled.value
  if (!list.length) return
  const at = list.indexOf(active.value)
  active.value = list[(at + dir + list.length) % list.length]!
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    if (!open.value) { toggle(); return }
    move(e.key === 'ArrowDown' ? 1 : -1)
  } else if (e.key === 'Enter' || e.key === ' ') {
    if (open.value && active.value >= 0) { e.preventDefault(); pick(props.options[active.value]!) }
  } else if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    e.stopPropagation()
    open.value = false
  }
}
</script>

<template>
  <div :class="['checkout-select', `checkout-select--${variant}`]">
    <span :id="`${id}-label`" class="checkout-select__label text-app-small-semibold">{{ label }}</span>
    <button
      ref="field"
      type="button"
      class="checkout-select__field"
      role="combobox"
      :aria-labelledby="`${id}-label ${id}-value`"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="listId"
      :aria-activedescendant="open && active >= 0 ? `${id}-opt-${active}` : undefined"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span :id="`${id}-value`" :class="['checkout-select__value', variant === 'host' ? (selected ? 'text-app-body-semibold' : 'text-app-small-regular') : 'text-app-small-semibold']">{{ selected?.label ?? placeholder }}</span>
      <img v-if="variant === 'host'" :class="['checkout-select__chevron', { 'checkout-select__chevron--up': open }]" src="/images/host/icon-arrow-down-24.svg" alt="" width="24" height="24" />
      <img v-else :class="['checkout-select__chevron', { 'checkout-select__chevron--up': open }]" src="/images/icon-arrow-down-16.svg" alt="" width="16" height="16" />
    </button>

    <ul v-show="open" :id="listId" class="checkout-select__list" role="listbox" :aria-labelledby="`${id}-label`">
      <li
        v-for="(o, i) in options"
        :id="`${id}-opt-${i}`"
        :key="o.id"
        role="option"
        :aria-selected="o.id === model ? 'true' : 'false'"
        :aria-disabled="o.disabled ? 'true' : undefined"
        :class="['checkout-select__option', { 'checkout-select__option--disabled': o.disabled, 'checkout-select__option--active': i === active }]"
        @mousedown.prevent
        @mousemove="!o.disabled && (active = i)"
        @click="pick(o)"
      >
        <span class="checkout-select__text">
          <span class="checkout-select__name">
            <span class="checkout-select__option-label text-app-small-semibold">{{ o.label }}</span>
            <span v-if="o.chip" :class="['checkout-select__chip', `checkout-select__chip--${o.chipTone ?? 'neutral'}`, o.chipTone === 'neutral' || !o.chipTone ? 'text-app-xsmall-semibold' : 'text-app-xsmall-regular']">{{ o.chip }}</span>
          </span>
          <span v-if="o.description" :class="['checkout-select__desc', variant === 'host' ? 'text-app-small-regular' : 'text-app-xsmall-regular']">{{ o.description }}</span>
        </span>
        <span v-if="o.value" class="checkout-select__price text-app-small-semibold">{{ o.value }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.checkout-select { display: flex; flex-direction: column; gap: var(--spacing-xs); width: 100%; }
.checkout-select__label { color: var(--color-text-checkout); }
.checkout-select__field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xs);
  width: 100%;
  padding: calc(var(--spacing-field) - var(--border-width-default)) calc(var(--spacing-md) - var(--border-width-default));
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-background-primary);
  color: var(--color-text-checkout);
  text-align: left;
  cursor: pointer;
}
.checkout-select__field:focus-visible,
.checkout-select__field[aria-expanded='true'] { outline: 0; border-color: var(--color-border-focus); }
.checkout-select__value { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.checkout-select__chevron { flex: none; transition: transform 150ms ease; }
.checkout-select__chevron--up { transform: scaleY(-1); }

.checkout-select__list {
  display: flex;
  flex-direction: column;
  max-height: 240px;
  margin: 0;
  padding: var(--spacing-md);
  overflow-y: auto;
  list-style: none;
  border: var(--border-width-default) solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-dropdown);
}
.checkout-select__option {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-lg);
  margin-inline: calc(-1 * var(--spacing-xs));
  padding: var(--spacing-sm) var(--spacing-xs);
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.checkout-select__option:first-child { padding-top: var(--spacing-xxs); }
.checkout-select__option:last-child { padding-bottom: var(--spacing-xxs); }
.checkout-select__option + .checkout-select__option { position: relative; }
.checkout-select__option + .checkout-select__option::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--spacing-xs);
  right: var(--spacing-xs);
  border-top: var(--border-width-default) solid var(--color-border-default);
}
.checkout-select__option--active { background: var(--color-background-secondary); } /* proposed */
.checkout-select__option--disabled { cursor: not-allowed; }
.checkout-select__text { display: flex; flex: 1 1 auto; flex-direction: column; gap: var(--spacing-xxs); min-width: 0; }
.checkout-select__name { display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacing-xs); }
.checkout-select__option-label { color: var(--color-text-checkout); }
.checkout-select__desc { color: var(--color-text-muted); }
.checkout-select__price { flex: none; color: var(--color-action-primary); }
.checkout-select__option--disabled .checkout-select__option-label,
.checkout-select__option--disabled .checkout-select__price { color: var(--color-text-muted); }
.checkout-select__option--disabled .checkout-select__desc { color: var(--color-text-disabled); }
.checkout-select__chip { display: inline-flex; align-items: center; height: 20px; padding: 0 var(--spacing-xs); border-radius: var(--radius-pill); white-space: nowrap; }
.checkout-select__chip--neutral { background: var(--color-background-neutral); color: var(--color-text-strong); }
.checkout-select__chip--alert { padding-inline: 7px; background: var(--color-badge-low); color: var(--color-text-inverse); }
/* Host an event (Figma frames 07-14) */
.checkout-select__chip--preset { padding: var(--spacing-micro) var(--spacing-xs); height: auto; border: var(--border-width-default) solid var(--color-host-preset-border); background: var(--color-host-preset-bg); color: var(--color-host-preset); }
.checkout-select--host .checkout-select__label { color: var(--color-text-option); }
.checkout-select--host .checkout-select__field { min-height: var(--sizing-control-field); padding-block: calc(var(--spacing-field) - var(--border-width-default)); border-color: var(--color-host-field-border); }
.checkout-select--host .checkout-select__field:hover { border-color: var(--color-border-strong); }
.checkout-select--host .checkout-select__field[aria-expanded='true'], .checkout-select--host .checkout-select__field:focus-visible { border-color: var(--color-border-focus); }
.checkout-select--host .checkout-select__list { max-height: none; }
.checkout-select--host .checkout-select__option { padding-block: calc(var(--spacing-sm) + 4px) calc(var(--spacing-sm) + 2px); } /* +4 (decision 27 Oct) */
.checkout-select--host .checkout-select__option-label { font-weight: var(--font-weight-bold); } /* bold titles (decision 27 Oct) */
.checkout-select--host .checkout-select__text { gap: 10px; }
.checkout-select--host .checkout-select__option + .checkout-select__option::before { border-top-color: var(--color-border-subtle); }

/* Host, phones (Figma mobile Create Ticket 10754:71145): placeholder Body
   semibold; option descriptions x-Small 12/18 in #141316 */
@media (max-width: 767px) {
  .checkout-select--host .checkout-select__value { font-size: var(--text-app-body-semibold-size); line-height: var(--text-app-body-semibold-line); font-weight: var(--text-app-body-semibold-weight); }
  .checkout-select--host .checkout-select__desc { font-size: var(--text-app-xsmall-regular-size); line-height: var(--text-app-xsmall-regular-line); color: var(--color-text-checkout); }
}

@media (prefers-reduced-motion: reduce) { .checkout-select__chevron { transition: none; } }
</style>
