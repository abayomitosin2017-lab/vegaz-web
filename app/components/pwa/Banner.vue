<script setup lang="ts">
/**
 * PwaBanner: "Install Vegaz on your device" (Figma Banner · Add to Home
 * Screen, 10924:400). Phones only, after a meaningful action
 * (usePwaInstall). A white card 16 from the sides, 12 above the bottom bar
 * (or the event ticket bar): 1px Grey_5, radius 16, Dp3 shadow, 12 / 8 / 12 /
 * 12 padding, 12 apart: 39 app icon, title (14/20 semibold Grey_1) and line
 * (12/18 Grey_2), 32 close X.
 * The whole card is the button: iPhone opens the steps sheet, Android opens
 * the browser's install pop-up. FLAG: Figma's title says "Intall"; built as
 * "Install".
 */
const props = defineProps<{ bottom: number }>()
const pwa = usePwaInstall()
const route = useRoute()
// Not over a full-screen conversation or the create-event flow
const blocked = computed(() => (route.path === '/chat' && !!route.query.chat) || route.path.startsWith('/host'))
const shown = computed(() => pwa.pending.value && !pwa.hidden.value && !blocked.value)
</script>

<template>
  <Transition name="pwa-banner">
    <div v-if="shown" class="pwa-banner" :style="{ bottom: `calc(${props.bottom}px + var(--spacing-sm) + env(safe-area-inset-bottom, 0px))` }">
      <button type="button" class="pwa-banner__main" @click="pwa.install()">
        <PwaAppIcon :size="39" />
        <span class="pwa-banner__text">
          <span class="pwa-banner__title">Install Vegaz on your device</span>
          <span class="pwa-banner__line">Add it to your Home Screen and access Vegaz easily</span>
        </span>
      </button>
      <button type="button" class="pwa-banner__close" aria-label="Not now" @click="pwa.dismiss()">
        <img src="/images/pwa/icon-close-16.svg" alt="" width="16" height="16" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-banner {
  position: fixed;
  left: var(--container-inset-mobile);
  right: var(--container-inset-mobile);
  z-index: 90;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-xs) var(--spacing-sm) var(--spacing-sm);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: 16px;
  background: var(--color-background-primary);
  box-shadow: var(--shadow-dp3);
}
@media (min-width: 768px) { .pwa-banner { display: none; } }
.pwa-banner__main { display: flex; flex: 1; align-items: center; gap: var(--spacing-sm); min-width: 0; padding: 0; border: 0; background: none; text-align: left; cursor: pointer; }
.pwa-banner__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pwa-banner__title { color: var(--color-text-strong); font-family: var(--font-family-base); font-size: 14px; font-weight: var(--font-weight-semibold); line-height: 20px; }
.pwa-banner__line { color: var(--color-text-secondary); font-family: var(--font-family-base); font-size: 12px; line-height: 18px; }
.pwa-banner__close { display: inline-flex; flex: none; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: var(--radius-pill); background: none; cursor: pointer; }
.pwa-banner__main:focus-visible, .pwa-banner__close:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; border-radius: 12px; }
.pwa-banner-enter-active, .pwa-banner-leave-active { transition: opacity 200ms ease, transform 200ms ease; }
.pwa-banner-enter-from, .pwa-banner-leave-to { opacity: 0; transform: translateY(12px); }
@media (prefers-reduced-motion: reduce) { .pwa-banner-enter-active, .pwa-banner-leave-active { transition: opacity 150ms ease; } .pwa-banner-enter-from, .pwa-banner-leave-to { transform: none; } }
</style>
