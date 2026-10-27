<script setup lang="ts">
/**
 * PwaAppIcon: the Vegaz app icon (Figma "PWA / App icon", page "PWA install"):
 * Primary square, radius 11.5 at 56 (scaled with `size`), the Vegaz mark
 * cropped to "az" + sparks, white.
 */
withDefaults(defineProps<{ size?: number }>(), { size: 56 })
</script>

<template>
  <span class="pwa-icon" :style="{ '--pwa-icon': `${size}px` }" aria-hidden="true">
    <span class="pwa-icon__crop"><img src="/images/pwa/app-icon-logo.svg" alt="" width="89" height="38" /></span>
  </span>
</template>

<style scoped>
/* Figma at 56: radius 11.49, 10.18 padding, mark area 35.64 x 37.33, logo 88.67 wide, right-aligned */
.pwa-icon {
  --pwa-scale: calc(var(--pwa-icon) / 56px);
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--pwa-icon);
  height: var(--pwa-icon);
  border-radius: calc(var(--pwa-icon) * 0.205);
  background: var(--color-action-primary);
}
.pwa-icon__crop { position: relative; overflow: hidden; width: calc(var(--pwa-icon) * 0.6364); height: calc(var(--pwa-icon) * 0.6667); }
.pwa-icon__crop img { position: absolute; top: 0; right: 0; width: calc(var(--pwa-icon) * 1.5833); height: auto; max-width: none; }
</style>
