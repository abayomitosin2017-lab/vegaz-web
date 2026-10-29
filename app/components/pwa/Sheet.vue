<script setup lang="ts">
/**
 * PwaSheet: "Add Vegaz to your Home Screen", iPhone only (Figma Bottom sheet
 * · Add to Home Screen, 10928:627). Opened from the banner on iPhone Safari,
 * which can't install with one tap; Android uses the browser's own pop-up.
 * Phones: bottom sheet (UiModal), 12 / 16 / 32 padding, 20 apart:
 *   56 app icon + 32 close X; title 24/32 bold Grey_1; line 16/24 Grey_2;
 *   Steps card (1px Grey_5, radius 16, 16 padding, 12 apart): "How to add it
 *   on iPhone" (decision 29 Oct: "(Safari)" removed) 12/18 semibold Grey_3, then 3 steps: 24 round number
 *   (12/18 semibold Primary on a Primary tint), title 14/20 semibold, line
 *   12/18 Grey_2, and a 148 x 76 picture of what to tap (screenshots from
 *   Figma);
 *   "Got it" (Primary, full width) and text-only "Not now".
 * Both buttons and the X close it and the banner for this visit (usePwaInstall).
 */
const pwa = usePwaInstall()
const id = useId()
const steps = [
  { title: 'Tap the Share icon', line: 'In your browser toolbar', img: '/images/pwa/ios-step-1.png', alt: 'Safari menu with Share at the top' },
  { title: 'Tap “Add to Home Screen”', line: 'Scroll down the menu to find it', img: '/images/pwa/ios-step-2.png', alt: 'Menu row “Add to Home Screen”' },
  { title: 'Tap “Add”', line: 'Vegaz lands on your Home Screen', img: '/images/pwa/ios-step-3.png', alt: '“Add to Home Screen” screen with the Add button' },
]
</script>

<template>
  <UiModal :open="pwa.sheetOpen.value" :width="393" :labelledby="`${id}-t`" phone="sheet" card-class="pwa-sheet-card" @close="pwa.dismiss()">
    <div class="pwa-sheet">
      <div class="pwa-sheet__head">
        <PwaAppIcon />
        <button type="button" class="pwa-sheet__close" aria-label="Close" @click="pwa.dismiss()">
          <img src="/images/pwa/icon-close-16.svg" alt="" width="16" height="16" />
        </button>
      </div>
      <div class="pwa-sheet__copy">
        <h2 :id="`${id}-t`" class="pwa-sheet__title">Add Vegaz to your Home Screen</h2>
        <p class="pwa-sheet__line">Open Vegaz in one tap, full screen, like any other app. No app store download needed.</p>
      </div>
      <div class="pwa-sheet__steps">
        <p class="pwa-sheet__label">How to add it on iPhone</p>
        <ol class="pwa-sheet__list">
          <li v-for="(s, i) in steps" :key="s.title" class="pwa-step">
            <span class="pwa-step__num" aria-hidden="true">{{ i + 1 }}</span>
            <span class="pwa-step__text">
              <span class="pwa-step__title">{{ s.title }}</span>
              <span class="pwa-step__line">{{ s.line }}</span>
            </span>
            <img class="pwa-step__img" :src="s.img" :alt="s.alt" width="148" height="76" />
          </li>
        </ol>
      </div>
      <div class="pwa-sheet__actions">
        <UiButton text-style="web" class="pwa-sheet__btn" data-autofocus @click="pwa.dismiss()">Got it</UiButton>
        <UiButton text-style="web" color="secondary" fill="ghost" class="pwa-sheet__btn pwa-sheet__btn--ghost" @click="pwa.dismiss()">Not now</UiButton>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.pwa-sheet { display: flex; flex-direction: column; gap: 20px; }
.pwa-sheet__head { display: flex; align-items: flex-start; justify-content: space-between; }
.pwa-sheet__close { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: var(--radius-pill); background: none; cursor: pointer; }
.pwa-sheet__close:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
.pwa-sheet__copy { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.pwa-sheet__title { margin: 0; color: var(--color-text-strong); font-family: var(--font-family-base); font-size: 24px; font-weight: 700; line-height: 32px; letter-spacing: -0.5px; }
.pwa-sheet__line { margin: 0; color: var(--color-text-secondary); font-family: var(--font-family-base); font-size: 16px; line-height: 24px; letter-spacing: -0.2px; }
.pwa-sheet__steps { display: flex; flex-direction: column; gap: var(--spacing-sm); padding: var(--spacing-md); border: var(--border-width-default) solid var(--color-border-default); border-radius: 16px; }
.pwa-sheet__label { margin: 0; color: var(--color-text-muted); font-family: var(--font-family-base); font-size: 12px; font-weight: var(--font-weight-semibold); line-height: 18px; }
.pwa-sheet__list { display: flex; flex-direction: column; gap: var(--spacing-sm); margin: 0; padding: 0; list-style: none; }
.pwa-step { display: flex; align-items: center; gap: var(--spacing-sm); }
.pwa-step__num {
  display: inline-flex; flex: none; align-items: center; justify-content: center; width: 24px; height: 24px; align-self: flex-start;
  border-radius: 12px; background: color-mix(in srgb, var(--color-action-primary) 8%, var(--base-white)); /* Figma Primary light 3 (blue ramp removed) */
  color: var(--color-action-primary); font-family: var(--font-family-base); font-size: 12px; font-weight: var(--font-weight-semibold); line-height: 18px;
}
.pwa-step__text { display: flex; flex: 1; flex-direction: column; gap: 2px; min-width: 0; }
.pwa-step__title { color: var(--color-text-strong); font-family: var(--font-family-base); font-size: 14px; font-weight: var(--font-weight-semibold); line-height: 20px; }
.pwa-step__line { color: var(--color-text-secondary); font-family: var(--font-family-base); font-size: 12px; line-height: 18px; }
.pwa-step__img { flex: none; width: 148px; height: 76px; border-radius: 12px; }
.pwa-sheet__actions { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.pwa-sheet__btn.ui-button { width: 100%; }
.pwa-sheet__btn--ghost { --ui-button-border-color: transparent; }
</style>

<style>
/* Figma sheet padding: 12 top (no handle in the web sheet), 16 sides, 32 bottom */
@media (max-width: 767px) { .pwa-sheet-card.ui-modal__card { padding: var(--spacing-lg) var(--spacing-md) calc(var(--spacing-xl) + env(safe-area-inset-bottom, 0px)); } }
</style>
