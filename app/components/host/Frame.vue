<script setup lang="ts">
import './styles.css'
/**
 * Body of a host step (Figma desktop frames 02-19, edition 01-06):
 *
 *   rail (360) | form (scrolls) | side panel (400, optional)
 *   ---------------- bottom bar (80, fixed) ----------------
 *
 * Form column: padding 48 / 64 (48 on every side when a side panel is shown),
 * items 32 apart, max width of the content follows the frame (952 without a
 * side panel, 584 with one).
 * Side panel: white, 1px Grey_5 line on the left, padding 48 / 32, 16 apart.
 * Bottom bar: 1px Grey_5 line on top, 0 64 padding; Back (secondary, 140)
 * on the left, Continue (180; "Create New Edition" 220) on the right; the
 * last step adds "Skip" (secondary, 180) before "Proceed". Continue is
 * drawn as the secondary button until the step is complete (decision 23 Oct).
 */
const props = withDefaults(defineProps<{
  backLabel?: string
  continueLabel?: string
  canContinue?: boolean
  busy?: boolean
  hideBack?: boolean
  /** Shows a "Skip" button before Continue (optional last step) */
  skipLabel?: string
  continueWidth?: number
}>(), { backLabel: 'Back', continueLabel: 'Continue', canContinue: false, busy: false, hideBack: false, skipLabel: undefined, continueWidth: 180 })
const emit = defineEmits<{ back: []; continue: []; skip: [] }>()
const slots = useSlots()

const form = ref<HTMLElement | null>(null)
defineExpose({ scrollTop: () => form.value?.scrollTo({ top: 0 }) })

function onContinue() {
  if (props.canContinue && !props.busy) emit('continue')
}
</script>

<template>
  <div class="host-frame">
    <div class="host-frame__body">
      <slot name="rail" />
      <div ref="form" :class="['host-frame__form', { 'host-frame__form--side': !!slots.side }]">
        <div class="host-frame__content">
          <slot />
        </div>
      </div>
      <aside v-if="slots.side" class="host-frame__side">
        <slot name="side" />
      </aside>
    </div>
    <div class="host-frame__bar">
      <UiButton v-if="!hideBack" class="host-frame__back" color="secondary" @click="emit('back')">{{ backLabel }}</UiButton>
      <span v-else />
      <div class="host-frame__right">
        <UiButton v-if="skipLabel" class="host-frame__skip" color="secondary" :aria-disabled="busy ? 'true' : undefined" @click="!busy && emit('skip')">{{ skipLabel }}</UiButton>
        <UiButton
          :class="['host-frame__next', { 'host-inactive': !canContinue }]"
          :style="{ width: `${continueWidth}px` }"
          :color="canContinue ? 'primary' : 'secondary'"
          :aria-disabled="!canContinue || busy ? 'true' : undefined"
          :aria-busy="busy ? 'true' : undefined"
          @click="onContinue"
        >{{ busy ? 'Publishing…' : continueLabel }}</UiButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.host-frame { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
.host-frame__body { flex: 1 1 auto; min-height: 0; display: flex; }
.host-frame__form {
  box-sizing: border-box;
  flex: 1 1 auto;
  min-width: 0;
  padding: var(--spacing-page-top) var(--spacing-4xl) var(--spacing-3xl);
  overflow-y: auto;
}
.host-frame__form--side { padding: var(--spacing-page-top) var(--spacing-3xl) var(--spacing-3xl); }
.host-frame__content { box-sizing: border-box; min-height: 100%; display: flex; flex-direction: column; gap: var(--spacing-xl); }
.host-frame__side {
  box-sizing: border-box;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: var(--sizing-host-side);
  padding: var(--spacing-3xl) var(--spacing-xl);
  border-left: var(--border-width-default) solid var(--color-border-default);
  overflow-y: auto;
  background: var(--color-background-primary);
}
.host-frame__bar {
  box-sizing: border-box;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--sizing-host-bottombar);
  padding: 0 var(--spacing-4xl);
  border-top: var(--border-width-default) solid var(--color-border-default);
  background: var(--color-background-primary);
}
.host-frame__right { display: flex; gap: var(--spacing-md); }

/* No tablet / phone design (decision: 1440 desktop only). PROPOSED, FLAG:
   1024-1279px  narrower rail (280) and side panel (320), 32px form padding
   below 1024   no rail; the side panel moves under the form and the whole
                body scrolls; bars use 16px sides and equal-width buttons */
@media (max-width: 1279px) {
  .host-frame__body :deep(.host-rail) { width: 280px; padding: var(--spacing-xl) var(--spacing-lg); }
  .host-frame__form, .host-frame__form--side { padding: var(--spacing-xl); }
  .host-frame__side { width: 320px; padding: var(--spacing-xl) var(--spacing-lg); }
}
@media (max-width: 1023px) {
  .host-frame__body { flex-direction: column; overflow-y: auto; }
  .host-frame__body :deep(.host-rail) { display: none; }
  .host-frame__form, .host-frame__form--side { flex: none; overflow: visible; padding: var(--spacing-lg) var(--spacing-md); }
  .host-frame__content { min-height: 0; }
  .host-frame__side { width: auto; overflow: visible; border-left: 0; border-top: var(--border-width-default) solid var(--color-border-default); padding: var(--spacing-lg) var(--spacing-md); }
  .host-frame__bar { padding: 0 var(--spacing-md); gap: var(--spacing-md); }
  .host-frame__right { flex: 2; }
  .host-frame__back.ui-button, .host-frame__skip.ui-button, .host-frame__next.ui-button { width: auto !important; flex: 1; padding-inline: var(--spacing-xs); }
}
</style>
