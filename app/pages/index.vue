<script setup lang="ts">
/**
 * Home.
 *   below 768px    Figma HOME/DEFAULT/MOBILE (node 10653:39287)
 *   768 - 1023px   desktop layout squeezed (no tablet design in Figma)
 *   1024px and up  Figma Desktop - 29 (node 9856:49029); content stops
 *                  growing at 1312px and stays centred on wider screens
 */
import { getHomeEvents } from '~/services/events'

// Lazy: the page shows at once with card placeholders until the events arrive (decision 27 Oct)
const { data: events, status, refresh } = useLazyAsyncData('home-events', getHomeEvents)
const loading = computed(() => !events.value && status.value !== 'error')
// Couldn't load: message + Try again in place of the rows (decision 27 Oct)
const failed = computed(() => !events.value && status.value === 'error')
// Rows with no events hide; with none at all, an empty message (decision 27 Oct)
const rows = computed(() => ({
  week: events.value?.happeningThisWeek ?? [],
  hot: events.value?.hotRightNow ?? [],
  upcoming: events.value?.upcoming ?? [],
  all: events.value?.exploreAll ?? [],
}))
const empty = computed(() => !!events.value && Object.values(rows.value).every(list => !list.length))
const { startHosting } = useHostEntry()
// Phones: "Install Vegaz" banner every time they land on Home (decision 27 Oct)
const pwa = usePwaInstall()
onMounted(() => pwa.nudge())
const { open: openAuth } = useAuthModal()
const { user } = useSession()
</script>

<template>
  <div class="home">
    <!-- Hero only for visitors who are not signed in (decision 27 Oct) -->
    <HomeHero v-if="!user" @join="openAuth()" />

    <div :class="['home__content', { 'home__content--no-hero': user }]">
      <UiErrorState v-if="failed" what="events" :level="2" @retry="refresh()" />
      <UiStateMessage
        v-else-if="empty"
        icon="/images/states/icon-calendar-search-32.svg"
        title="No events yet"
        text="New events are added all the time. Check back soon, or host your own."
        action-label="Add your Event"
        :level="2"
        @action="startHosting()"
      />
      <template v-else>
      <EventSection v-if="loading || rows.week.length" title="Happening this week" :events="rows.week" :loading="loading" card-size="small" />
      <EventSection v-if="loading || rows.hot.length" title="Hot events right now" :events="rows.hot" :loading="loading" card-size="medium" class="home__medium-row" />
      <EventSection v-if="loading || rows.upcoming.length" title="Upcoming events" :events="rows.upcoming" :loading="loading" card-size="medium" class="home__medium-row" />
      <HomePromoBanners />
      <EventSection v-if="loading || rows.all.length" title="Explore all events" :events="rows.all" :loading="loading" card-size="small">
        <template #action>
          <UiButton color="secondary" text-style="web" @click="navigateTo('/events')">Explore all</UiButton>
        </template>
      </EventSection>
      </template>
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
  padding: var(--spacing-xl) var(--container-inset-mobile) var(--spacing-lg); /* 24 above the footer (decision 27 Oct; was 42) */
}

/* ---- 768px and up ---- */
@media (min-width: 768px) {
  .home__content {
    gap: var(--spacing-2xl);
    padding: 46px var(--container-inset-tablet) var(--spacing-lg); /* 24 above the footer (decision 27 Oct; was 141) */
  }
  /* Figma Medium card instances: 285.3px tall, of which the image is 193.3px
     (used from 1024px; below that the image is square) */
  .home__medium-row { --event-card-media-height: 193.3px; }
}
@media (min-width: 1024px) {
  .home__content {
    /* Figma HOME/DEFAULT: 46px below the hero; 24 above the footer (decision 27 Oct) */
    padding-inline: var(--container-inset-desktop);
  }
}
/* No hero (signed in): the first row sits 24 under the header like other pages */
.home .home__content--no-hero { padding-top: var(--spacing-page-top); }
</style>
