<script setup lang="ts">
/**
 * Home.
 *   below 768px    Figma HOME/DEFAULT/MOBILE (node 10653:39287)
 *   768 - 1023px   desktop layout squeezed (no tablet design in Figma)
 *   1024px and up  Figma Desktop - 29 (node 9856:49029); content stops
 *                  growing at 1312px and stays centred on wider screens
 */
import { getHomeEvents } from '~/services/events'

const { data: events } = await useAsyncData('home-events', getHomeEvents)
</script>

<template>
  <div class="home">
    <HomeHero />

    <div v-if="events" class="home__content">
      <EventSection title="Happening this week" :events="events.happeningThisWeek" card-size="small" />
      <EventSection title="Hot events right now" :events="events.hotRightNow" card-size="medium" class="home__medium-row" />
      <EventSection title="Upcoming events" :events="events.upcoming" card-size="medium" class="home__medium-row" />
      <HomePromoBanners />
      <EventSection title="Explore all events" :events="events.exploreAll" card-size="small">
        <template #action>
          <UiButton color="secondary" text-style="web">Explore all</UiButton>
        </template>
      </EventSection>
    </div>
  </div>
</template>

<style scoped>
/* ---- Mobile (< 768px) ---- */
.home__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  max-width: calc(var(--container-web-desktop-max) + 2 * var(--container-inset-desktop));
  margin-inline: auto;
  overflow-x: clip; /* rows and banners scroll inside themselves, never the page */
  /* Pixel-exact to Figma mobile: 32px below the hero, 42px above the footer
     (41.8 in the latest frame). FLAG: off the spacing scale. */
  padding: var(--spacing-xl) var(--container-inset-mobile) 42px;
}

/* ---- 768px and up ---- */
@media (min-width: 768px) {
  .home__content {
    gap: var(--spacing-2xl);
    padding: 46px var(--container-inset-tablet) 141px;
  }
  /* Figma Medium card instances: 285.3px tall, of which the image is 193.3px
     (used from 1024px; below that the image is square) */
  .home__medium-row { --event-card-media-height: 193.3px; }
}
@media (min-width: 1024px) {
  .home__content {
    /* Pixel-exact to Figma HOME/DEFAULT at 1440: 46px below the hero,
       141px above the footer. FLAG: off the spacing scale. */
    padding-inline: var(--container-inset-desktop);
  }
}
</style>
