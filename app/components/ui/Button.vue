<script setup lang="ts">
/**
 * UiButton: from Figma component set "button" (node 36:3560).
 *
 * Figma axis      -> prop
 *   size          -> size    'standard' (48px) | 'small' (40px)
 *   fill          -> fill    'solid' | 'outline' | 'ghost'  (Figma "no")
 *   Color         -> color   'primary' | 'secondary'
 *   Icon          -> #icon slot (24px)
 *   chevron       -> chevron prop + #chevron slot (18 x 9)
 *   Label=no      -> iconOnly prop (requires aria-label)
 *   Dark mode     -> not built (not needed for web)
 *
 * textStyle (not a Figma axis): which text style the label uses.
 *   'app' (default) -> Mobile App Body/Small semibold, fixed 16/24 and 14/20
 *   'web'           -> Web Body semibold, 16/24 below 1024px, 18/28 from 1024px.
 *                      Used where Figma instances show 18/28 labels
 *                      (home hero, "Explore all"). Standard size only.
 *
 * Instance overrides seen in Figma screens, exposed as CSS custom properties
 * so a screen can match an instance without new variants:
 *   --ui-button-pad-x         side padding (e.g. header "Host an Event": 32px)
 *   --ui-button-border-color  border colour (e.g. hero "Explore Events": Grey_3)
 *   --ui-button-pad-y, --ui-button-min-height, --ui-button-font-weight
 *                             compact pills (e.g. mobile chat "Buy Ticket":
 *                             8 / 4 padding, 28px tall, regular weight)
 *
 * Hover, pressed, disabled and focus styles are PROPOSED (not in Figma).
 * They use tokens from semantic.css section B.
 */
type Size = 'standard' | 'small'
type Fill = 'solid' | 'outline' | 'ghost'
type Color = 'primary' | 'secondary'
type TextStyle = 'app' | 'web'

const props = withDefaults(
  defineProps<{
    size?: Size
    fill?: Fill
    color?: Color
    chevron?: boolean
    iconOnly?: boolean
    textStyle?: TextStyle
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  { size: 'standard', fill: 'solid', color: 'primary', chevron: false, iconOnly: false, textStyle: 'app', type: 'button', disabled: false },
)

const attrs = useAttrs()
if (import.meta.dev && props.iconOnly && !attrs['aria-label'] && !attrs['aria-labelledby']) {
  console.warn('[UiButton] An icon-only button needs an aria-label so screen readers can name it.')
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'ui-button',
      `ui-button--${size}`,
      `ui-button--${fill}`,
      `ui-button--${color}`,
      { 'ui-button--icon-only': iconOnly, 'ui-button--text-web': textStyle === 'web' },
    ]"
  >
    <span class="ui-button__content">
      <span v-if="$slots.icon" class="ui-button__icon" aria-hidden="true"><slot name="icon" /></span>
      <span v-if="!iconOnly" class="ui-button__label"><slot /></span>
      <span v-if="chevron" class="ui-button__chevron" aria-hidden="true"><slot name="chevron" /></span>
    </span>
  </button>
</template>

<style scoped>
.ui-button {
  /* per-variant values, set below */
  --btn-bg: transparent;
  --btn-border: transparent;
  --btn-fg: var(--color-text-primary);
  --btn-bg-hover: var(--btn-bg);
  --btn-bg-active: var(--btn-bg);
  /* Airbnb primary button: 48 tall, 14 / 24 padding, 16/20 w500 */
  --btn-pad-x: var(--spacing-lg);
  --btn-pad-y: var(--spacing-field);
  --btn-min-height: var(--sizing-control-standard);

  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--ui-button-min-height, var(--btn-min-height));
  /* Figma strokes sit inside the frame, so padding is reduced by the border
     width to keep the same total size as Figma on every variant. */
  padding: calc(var(--ui-button-pad-y, var(--btn-pad-y)) - var(--border-width-default)) calc(var(--ui-button-pad-x, var(--btn-pad-x)) - var(--border-width-default));
  border: var(--border-width-default) solid var(--ui-button-border-color, var(--btn-border));
  border-radius: var(--radius-pill);
  background: var(--btn-bg);
  color: var(--btn-fg);
  font-family: var(--font-family-base);
  font-weight: var(--ui-button-font-weight, var(--font-weight-semibold)); /* 600 on every button (decision 27 Oct) */
  font-size: var(--text-app-body-semibold-size);
  line-height: var(--text-app-body-semibold-line);
  letter-spacing: var(--text-app-body-semibold-tracking);
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease; /* proposed */
}

.ui-button__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}
.ui-button__icon { display: inline-flex; width: var(--sizing-icon-standard); height: var(--sizing-icon-standard); flex: none; }
.ui-button__chevron { display: inline-flex; width: 18px; height: 9px; flex: none; }

/* ---- size ---- */
/* Airbnb pill button ("Become a host"): 40 tall, 11 / 12 padding, 14/18 w500 */
.ui-button--small {
  --btn-pad-x: var(--spacing-sm);
  --btn-pad-y: 11px;
  --btn-min-height: var(--sizing-control-compact);
  font-size: var(--text-app-small-semibold-size);
  line-height: var(--text-app-small-semibold-line);
  letter-spacing: var(--text-app-small-semibold-tracking);
  font-weight: var(--ui-button-font-weight, var(--font-weight-semibold)); /* 600 on every button (decision 27 Oct) */
}
.ui-button--icon-only { --btn-pad-x: var(--spacing-md); }
/* A 24px icon is taller than the 20 / 18 text line: trim the top and bottom
   padding so the button keeps Airbnb's 48 / 40 height */
.ui-button:has(.ui-button__icon) { --btn-pad-y: var(--spacing-sm); }
.ui-button--small:has(.ui-button__icon) { --btn-pad-y: var(--spacing-xs); }
.ui-button--small.ui-button--icon-only { --btn-pad-x: var(--spacing-xs); }
.ui-button--standard.ui-button--text-web {
  font-size: var(--text-body-semibold-size);
  line-height: var(--text-body-semibold-line);
  letter-spacing: var(--text-body-semibold-tracking);
  font-weight: var(--ui-button-font-weight, var(--font-weight-semibold)); /* 600 on every button (decision 27 Oct) */
}

/* ---- primary ---- */
.ui-button--primary.ui-button--solid {
  --btn-bg: var(--color-action-primary);
  --btn-fg: var(--color-text-on-action-primary);
  --btn-bg-hover: var(--color-action-primary-hover);
  --btn-bg-active: var(--color-action-primary-pressed);
}
.ui-button--primary.ui-button--outline {
  --btn-border: var(--color-action-primary);
  --btn-fg: var(--color-action-primary);
}
.ui-button--primary.ui-button--ghost { --btn-fg: var(--color-action-primary); }

/* ---- secondary ---- */
.ui-button--secondary { --btn-fg: var(--color-text-strong); }
/* Airbnb: every button uses 24 side padding (the old per-variant 32 is gone) */
/* Figma (updated 21 Oct): secondary solid = Action secondary (Grey_6) at both
   sizes; standard adds a 1px Grey_5 border, small has none */
.ui-button--secondary.ui-button--solid.ui-button--standard {
  --btn-bg: var(--color-action-secondary);
  --btn-border: var(--color-border-default);
}
.ui-button--secondary.ui-button--solid.ui-button--small { --btn-bg: var(--color-action-secondary); }
.ui-button--secondary.ui-button--solid {
  --btn-bg-hover: var(--color-action-secondary-hover);
  --btn-bg-active: var(--color-action-secondary-pressed);
}
.ui-button--secondary.ui-button--outline { --btn-border: var(--color-border-strong); }

/* ---- hover / pressed (proposed) ---- */
.ui-button--outline,
.ui-button--ghost {
  --btn-bg-hover: var(--color-background-secondary);
  --btn-bg-active: var(--color-background-neutral); /* Grey_5 */
}
.ui-button:hover:not(:disabled) { background: var(--btn-bg-hover); }
.ui-button:active:not(:disabled) { background: var(--btn-bg-active); }

/* ---- focus (proposed) ---- */
.ui-button:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* ---- disabled (proposed) ---- */
.ui-button:disabled {
  cursor: not-allowed;
  background: var(--color-background-disabled);
  border-color: var(--color-border-disabled);
  color: var(--color-text-disabled);
}
/* Inactive (disabled, or aria-disabled while a form isn't ready): text and
   icons at 60% opacity, everywhere (decision 27 Oct) */
.ui-button:disabled .ui-button__content,
.ui-button[aria-disabled="true"] .ui-button__content { opacity: 0.6; }
.ui-button[aria-disabled="true"] { cursor: not-allowed; }
.ui-button--outline:disabled,
.ui-button--ghost:disabled { background: transparent; }
.ui-button--ghost:disabled { border-color: transparent; }

@media (prefers-reduced-motion: reduce) {
  .ui-button { transition: none; }
}
</style>
