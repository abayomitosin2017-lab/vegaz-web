<script setup lang="ts">
/**
 * EventAppBanner: "Download the Vegaz app to see more event and create yours"
 * (Figma event details). Dark #141316 card, radius 24, 24px padding, 24px gap.
 * Heading Headline 3 semibold #FFFDF6 (phones: 16/26 semibold).
 * Button: white pill, 44px tall, 24px sides; "Download App" Web Body semibold
 * Primary, a thin divider, then the Apple and Play Store marks (18px).
 * OPEN ITEM: store link (same placeholder as onboarding; nothing opens yet).
 */
import { appStoreLinks } from '~/config/footer'

function download() {
  const href = appStoreLinks[0]?.href ?? '#'
  if (href !== '#') window.open(href, '_blank', 'noopener')
}
</script>

<template>
  <section class="app-banner" aria-labelledby="app-banner-title">
    <h2 id="app-banner-title" class="app-banner__title">Download the Vegaz app to see more event and create yours</h2>
    <button type="button" class="app-banner__button text-body-semibold" @click="download">
      Download App
      <span class="app-banner__marks" aria-hidden="true">
        <span class="app-banner__divider" />
        <img src="/images/event/icon-apple-18.svg" alt="" width="16" height="16" />
        <img src="/images/event/icon-playstore-18.svg" alt="" width="16" height="16" />
      </span>
    </button>
  </section>
</template>

<style scoped>
.app-banner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background: var(--color-surface-inverse);
}
.app-banner__title {
  margin: 0;
  color: var(--color-text-on-inverse);
  font-size: var(--text-detail-section-title-size);
  font-weight: var(--text-detail-section-title-weight);
  line-height: var(--text-detail-section-title-line);
  letter-spacing: var(--text-detail-section-title-tracking);
}
.app-banner__button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  height: var(--sizing-control-touch);
  padding: 0 var(--spacing-lg);
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-background-primary);
  color: var(--color-action-primary);
  cursor: pointer;
}
.app-banner__button:focus-visible { outline: var(--focus-ring-width) solid var(--color-background-primary); outline-offset: var(--focus-ring-offset); }
.app-banner__marks { display: inline-flex; align-items: center; gap: var(--spacing-xs); align-self: stretch; }
.app-banner__divider { width: 1px; align-self: stretch; margin-block: var(--spacing-sm); background: var(--color-border-default); }

@media (max-width: 767px) {
  .app-banner__title { font-size: var(--text-body-semibold-size); line-height: 26px; letter-spacing: 0; }
}
</style>
