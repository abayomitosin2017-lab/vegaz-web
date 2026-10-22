<script setup lang="ts">
/**
 * HomePromoBanners: the two promo banners on Home ("Refer a host" first,
 * "Get free tickets" second). Each banner is one SVG exported from Figma,
 * text and corner radius included, so it scales as a single image.
 *
 *   - below 768px: square 330 x 330 banners (Figma HOME/DEFAULT/MOBILE,
 *     frame 10655:47038) in a row that scrolls sideways, 16px gap
 *   - 768px and up: wide 644 x 168 banners (Figma HOME/DEFAULT, 10653:38259)
 *     sharing the row, 24px gap; they scale down evenly on narrower screens
 *
 * OPEN ITEM: Figma gives no destination, so the banners are not links yet.
 */
const banners = [
  {
    wide: '/images/banner-refer-host.svg',
    square: '/images/banner-refer-host-square.svg',
    alt: 'Refer a host and earn up to 100k. Invite a host and earn a percentage of every ticket sold by the host.',
  },
  {
    wide: '/images/banner-free-tickets.svg',
    square: '/images/banner-free-tickets-square.svg',
    alt: 'Get free tickets to events. For UGC and content creators who love nightlife, culture and experiences.',
  },
]
</script>

<template>
  <div class="promo-banners">
    <picture v-for="banner in banners" :key="banner.wide" class="promo-banners__item">
      <source media="(min-width: 768px)" :srcset="banner.wide" width="644" height="168" />
      <img class="promo-banners__image" :src="banner.square" :alt="banner.alt" width="330" height="330" />
    </picture>
  </div>
</template>

<style scoped>
/* ---- Mobile (< 768px): square banners, sideways scroll like the card rows ---- */
.promo-banners {
  display: flex;
  gap: var(--spacing-md);
  margin-inline: calc(-1 * var(--container-inset-mobile));
  padding-inline: var(--container-inset-mobile);
  overflow-x: auto;
}
.promo-banners__item { flex: none; width: 330px; }
.promo-banners__image {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
}

/* ---- 768px and up: wide banners share the row (644 x 168 each at 1440) ---- */
@media (min-width: 768px) {
  .promo-banners {
    gap: var(--spacing-lg);
    margin-inline: 0;
    padding-inline: 0;
    overflow: visible;
  }
  .promo-banners__item { flex: 1 0 0; min-width: 0; width: auto; }
  .promo-banners__image { aspect-ratio: 644 / 168; }
}
</style>
