<script setup lang="ts">
/**
 * LayoutFooter: Figma "Footer" component (node 9864:56123),
 * Show app links = true, Show navigation links = true.
 *   - below 768px: mobile variant (app badges first, links in two pairs of
 *     columns, logo above copyright)
 *   - 768px and up: desktop variant (768-1023 is the desktop layout squeezed,
 *     with 32px side margins; no tablet design in Figma)
 *
 * Content lives in config/footer.ts.
 * FLAG: Footer colours come from a separate Figma "Gray" collection
 * (Gray/200, 500, 600, 900), not the Grey_1..6 tokens. Kept as designed.
 * Hover states: none in Figma, none added. Focus ring uses the approved token.
 */
import { appStoreLinks, copyrightText, footerColumns } from '~/config/footer'

// Mobile shows the four columns as two side-by-side pairs; desktop ignores the pairing.
const columnPairs = [footerColumns.slice(0, 2), footerColumns.slice(2, 4)]
// "Host an Event": same entry as the header button (logs in first when signed out)
const { startHosting } = useHostEntry()

withDefaults(defineProps<{ showAppLinks?: boolean; showNavigationLinks?: boolean }>(), {
  showAppLinks: true,
  showNavigationLinks: true,
})
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__container site-footer__container--top">
      <div class="site-footer__content">
        <nav v-if="showNavigationLinks" class="site-footer__links" aria-label="Footer">
          <div v-for="(pair, i) in columnPairs" :key="i" class="site-footer__pair">
            <div v-for="column in pair" :key="column.heading" class="site-footer__column">
              <h2 class="site-footer__heading text-body-semibold">{{ column.heading }}</h2>
              <ul class="site-footer__list">
                <li v-for="link in column.links" :key="link.label">
                  <a v-if="link.action === 'host'" class="site-footer__link text-body-regular" :href="link.href" @click.prevent="startHosting">{{ link.label }}</a>
                  <NuxtLink v-else-if="link.href.startsWith('/')" class="site-footer__link text-body-regular" :to="link.href">{{ link.label }}</NuxtLink>
                  <a v-else class="site-footer__link text-body-regular" :href="link.href">{{ link.label }}</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div v-if="showAppLinks" class="site-footer__apps">
          <h2 class="site-footer__apps-heading text-small-semibold">Get the Vegaz app</h2>
          <div class="site-footer__badges">
            <a v-for="store in appStoreLinks" :key="store.label" class="site-footer__badge" :href="store.href">
              <img :src="store.image" :alt="store.label" width="172" height="51" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="site-footer__container">
      <div class="site-footer__bottom">
        <img class="site-footer__logo" src="/images/logo-footer.svg" alt="Vegaz" width="99" height="42" />
        <p class="site-footer__copyright text-body-regular">{{ copyrightText }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* ================= Mobile (< 768px), Figma HOME/DEFAULT/MOBILE ================= */
.site-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4xl);
  padding: var(--spacing-4xl) 0 var(--spacing-3xl);
  overflow: clip;
  background: var(--color-background-secondary);
}

.site-footer__container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  width: 100%;
  max-width: var(--container-web-desktop-max); /* lines up with the header (Airbnb 48 margins at 1440) */
  padding-inline: var(--container-inset-mobile);
}
.site-footer__container--top { gap: var(--spacing-3xl); }

.site-footer__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-3xl);
}

.site-footer__links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  width: 100%;
}
.site-footer__pair {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-xl);
}
.site-footer__column {
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: var(--spacing-md);
  min-width: 96px;
}
/* FLAG: Figma gives the second column of each pair a fixed width that differs
   (Company 143px, Legal 131px), so they do not line up. Kept as designed. */
.site-footer__pair:first-child .site-footer__column:nth-child(2) { flex: none; width: 143px; }
.site-footer__pair:last-child .site-footer__column:nth-child(2) { flex: none; width: 131px; }

.site-footer__heading { color: var(--color-footer-text-muted); }
.site-footer__list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}
.site-footer__link {
  display: inline-flex;
  border-radius: var(--radius-md); /* Figma link frame radius 12 */
  color: var(--color-footer-link);
  text-decoration: none;
  white-space: nowrap;
}

.site-footer__apps {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 171.563px; /* heading width follows the badges in Figma */
  order: -1; /* mobile: app badges come first */
}
.site-footer__apps-heading { color: var(--color-footer-text-strong); }
.site-footer__badges {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-md);
}
.site-footer__badge { display: block; border-radius: var(--radius-sm); color: inherit; }
/* Figma badge frame: 171.563 x 50.833 */
.site-footer__badge img { width: 171.563px; height: 50.833px; }

.site-footer__bottom {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-2xl);
  padding-top: calc(var(--spacing-xl) - var(--border-width-default)); /* 1px border sits inside, as in Figma */
  border-top: var(--border-width-default) solid var(--color-footer-divider);
}
/* Airbnb logo height 32 (Vegaz footer logo scaled from 99 x 41.885) */
.site-footer__logo { display: block; width: auto; height: var(--sizing-logo-height); }
.site-footer__copyright { color: var(--color-footer-text-muted); white-space: nowrap; }

.site-footer__link:focus-visible,
.site-footer__badge:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* ================= Desktop (>= 768px), Figma Desktop - 29 ================= */
@media (min-width: 768px) {
  .site-footer { padding: var(--spacing-4xl) var(--container-inset-tablet); }
  .site-footer__container { padding-inline: 0; }

  .site-footer__content {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--spacing-3xl) var(--spacing-4xl); /* Figma: 48 row, 64 column */
  }
  .site-footer__links {
    flex-direction: row;
    flex: 1 0 0;
    align-items: flex-start;
    min-width: 640px;
  }
  .site-footer__pair { display: contents; }
  .site-footer__pair:first-child .site-footer__column:nth-child(2),
  .site-footer__pair:last-child .site-footer__column:nth-child(2) { flex: 1 0 0; width: auto; }
  .site-footer__apps { order: 0; }

  .site-footer__bottom {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-lg) 0;
  }
}
@media (min-width: 1024px) {
  .site-footer { padding-inline: var(--container-inset-desktop); }
}
</style>
