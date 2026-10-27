<script setup lang="ts">
/**
 * HomePromoBanners: the promo banners on Home ("Refer a host", "Get free
 * tickets").
 *
 * Phones (< 768px, unchanged): the two square banners (Figma
 * HOME/DEFAULT/MOBILE 10655:47038), each one SVG, in a row that scrolls
 * sideways, 16px gap.
 *
 * 768px and up (Figma HOME/DEFAULT 10653:38259 / 10904:35652, decision
 * 27 Oct): ONE full-width banner at a time; they cross-fade (0.6s) every 30
 * seconds, round and round. Two dots under it show which is on and switch
 * on click; the timer pauses while the pointer or keyboard focus is on the
 * banner. Built from parts so the art can move:
 *   - Primary card, radius 20, 168 tall, 16 padding.
 *   - Illustration (231, from the left edge, 8 above the top, clipped).
 *     Animation (PROPOSED): slow float with a slight tilt (6s) and the white
 *     sparkles twinkle; off for people who reduce motion.
 *   - Text block centred, 323 wide: title 34/34 Outfit Black (900), lime
 *     (Refer) or pink (Tickets); 16 below, 14/18 white (277 wide).
 *   - 48 round arrow (Figma update 27 Oct, was 56): Pink on "Refer a host",
 *     cyan on "Get free tickets"; 46 from the right, centred.
 * OPEN ITEM: Figma gives no destination, so the banners and arrow are not
 * links yet.
 */
import referArt from '~/assets/illustrations/refer-host.svg?raw'
import ticketsArt from '~/assets/illustrations/free-tickets.svg?raw'

const banners = [
  {
    id: 'refer',
    title: 'Refer a host and earn up to 100k',
    text: 'Invite a host and earn a percentage of every ticket sold by the host.',
    tone: 'lime',
    art: referArt,
    artClass: 'promo-art--refer',
    arrow: '/images/banner-arrow-refer-48.svg', // Pink
    square: '/images/banner-refer-host-square.svg',
    alt: 'Refer a host and earn up to 100k. Invite a host and earn a percentage of every ticket sold by the host.',
  },
  {
    id: 'tickets',
    title: 'Get free tickets to events',
    text: 'For UGC & content creators who love nightlife, culture & experiences.',
    tone: 'pink',
    art: ticketsArt,
    artClass: 'promo-art--tickets',
    arrow: '/images/banner-arrow-tickets-48.svg', // cyan (Figma update 27 Oct)
    square: '/images/banner-free-tickets-square.svg',
    alt: 'Get free tickets to events. For UGC and content creators who love nightlife, culture and experiences.',
  },
]

const SWITCH_MS = 30_000
const current = ref(0)
const paused = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
function restart() {
  clearInterval(timer)
  timer = setInterval(() => { if (!paused.value) current.value = (current.value + 1) % banners.length }, SWITCH_MS)
}
function show(i: number) { current.value = i; restart() }
onMounted(restart)
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="promo">
    <!-- Phones: unchanged square banners -->
    <div class="promo-banners">
      <img v-for="b in banners" :key="b.id" class="promo-banners__image" :src="b.square" :alt="b.alt" width="330" height="330" />
    </div>

    <!-- 768px and up: one banner at a time -->
    <section
      class="promo-rotator"
      aria-roledescription="carousel"
      aria-label="Vegaz offers"
      @mouseenter="paused = true"
      @mouseleave="paused = false"
      @focusin="paused = true"
      @focusout="paused = false"
    >
      <div class="promo-rotator__stage">
        <article
          v-for="(b, i) in banners"
          :key="b.id"
          :class="['promo-card', { 'promo-card--on': i === current }]"
          :aria-hidden="i === current ? undefined : 'true'"
          aria-roledescription="slide"
          :aria-label="`${i + 1} of ${banners.length}`"
        >
          <!-- eslint-disable-next-line vue/no-v-html -- trusted local SVG -->
          <div :class="['promo-art', b.artClass]" v-html="b.art" />
          <div class="promo-card__copy">
            <h2 :class="['promo-card__title', `promo-card__title--${b.tone}`]">{{ b.title }}</h2>
            <p class="promo-card__text">{{ b.text }}</p>
          </div>
          <img class="promo-card__arrow" :src="b.arrow" alt="" width="48" height="48" aria-hidden="true" />
        </article>
      </div>
      <div class="promo-rotator__dots" role="group" aria-label="Choose an offer">
        <button
          v-for="(b, i) in banners"
          :key="b.id"
          type="button"
          :class="['promo-rotator__dot', { 'promo-rotator__dot--on': i === current }]"
          :aria-label="`Show offer ${i + 1}: ${b.title}`"
          :aria-pressed="i === current"
          @click="show(i)"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ---- Phones (< 768px): square banners, sideways scroll like the card rows ---- */
.promo-banners {
  display: flex;
  gap: var(--spacing-md);
  margin-inline: calc(-1 * var(--container-inset-mobile));
  padding-inline: var(--container-inset-mobile);
  overflow-x: auto;
  scrollbar-width: none;
}
.promo-banners::-webkit-scrollbar { display: none; }
.promo-banners__image { flex: none; width: 330px; height: auto; aspect-ratio: 1 / 1; }
.promo-rotator { display: none; }

/* ---- 768px and up: one wide banner at a time ---- */
@media (min-width: 768px) {
  .promo-banners { display: none; }
  .promo-rotator { display: flex; flex-direction: column; align-items: center; gap: var(--spacing-sm); }
  .promo-rotator__stage { display: grid; width: 100%; }
  .promo-card {
    grid-area: 1 / 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 168px;
    padding: var(--spacing-md);
    overflow: hidden;
    border-radius: 20px;
    background: var(--color-action-primary);
    opacity: 0;
    visibility: hidden;
    transition: opacity 600ms ease, visibility 0s linear 600ms;
  }
  .promo-card--on { opacity: 1; visibility: visible; transition: opacity 600ms ease, visibility 0s; }
  .promo-card__copy { position: relative; z-index: 1; display: flex; flex-direction: column; gap: var(--spacing-md); width: 323px; max-width: 42%; }
  .promo-card__title {
    margin: 0;
    font-family: var(--font-family-base);
    font-weight: 900;
    font-size: 34px;
    line-height: 1;
    text-transform: uppercase;
  }
  .promo-card__title--lime { color: #c6ff00; } /* Figma "Lime" */
  .promo-card__title--pink { color: #ff4081; } /* Figma "Pink" */
  .promo-card__text { max-width: 277px; margin: 0; color: var(--base-white); font-family: var(--font-family-base); font-size: 14px; line-height: 18px; }
  .promo-card__arrow { position: absolute; top: 50%; right: 46px; width: 48px; height: 48px; transform: translateY(-50%); }

  /* Illustration: 231 square from the card's left edge, 8 above its top */
  .promo-art { position: absolute; top: -8px; left: 0; width: 231px; height: 231px; }
  .promo-art--tickets { display: flex; align-items: center; justify-content: center; width: 228px; height: 228px; }
  .promo-art :deep(.promo-art__svg) { display: block; width: 100%; height: 100%; }
  .promo-art--tickets :deep(.promo-art__svg) { width: 195px; height: 195px; transform: rotate(-10.6deg); }

  /* Dots: 8 round, the current one a 20-wide Primary pill (PROPOSED) */
  .promo-rotator__dots { display: flex; gap: var(--spacing-xs); }
  .promo-rotator__dot { width: 8px; height: 8px; padding: 0; border: 0; border-radius: var(--radius-pill); background: var(--color-border-default); cursor: pointer; transition: width 200ms ease, background-color 200ms ease; }
  .promo-rotator__dot--on { width: 20px; background: var(--color-action-primary); }
  .promo-rotator__dot:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 3px; }

  /* Motion (PROPOSED): float + tilt, sparkles twinkle */
  @media (prefers-reduced-motion: no-preference) {
    .promo-card--on .promo-art :deep(.promo-art__svg) { animation: promo-float 6s ease-in-out infinite; }
    .promo-card--on .promo-art--tickets :deep(.promo-art__svg) { animation-name: promo-float-tilted; }
    .promo-card--on .promo-art :deep(.promo-art__spark) { transform-box: fill-box; transform-origin: center; animation: promo-twinkle 2.4s ease-in-out infinite; }
    .promo-card--on .promo-art :deep(.promo-art__spark--2) { animation-delay: 0.8s; }
    .promo-card--on .promo-art :deep(.promo-art__spark--3) { animation-delay: 1.6s; }
  }
}
@keyframes promo-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-6px) rotate(-2deg); }
}
@keyframes promo-float-tilted {
  0%, 100% { transform: translateY(0) rotate(-10.6deg); }
  50% { transform: translateY(-6px) rotate(-13deg); }
}
@keyframes promo-twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.25; transform: scale(0.55); }
}
</style>
