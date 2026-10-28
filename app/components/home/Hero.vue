<script setup lang="ts">
/**
 * HomeHero: hero band of Home (Figma HOME/DEFAULT 10847:27412 and
 * HOME/DEFAULT/MOBILE 10847:27650, decision 27 Oct).
 *
 * Desktop (>= 1024): Grey_6 band, 70 above and below. Title left (56/64 bold,
 * -1 letter spacing, Grey_1, up to 581 wide); on the right a 506 column with
 * the sentence (18/28 regular Grey_2) and, 24 below, "Join Vegaz" as the
 * Airbnb-size standard button (48 tall, 16/20, 24 sides, fits its text;
 * decision 27 Oct, Figma's 240 × 52 felt too big). Sides line up with the page content (decision:
 * the page margin, not Figma's 58).
 * Tablet (768-1023): same layout, today's sizes (title 40/48, text 16/24)
 * so it fits; 40 above and below.
 * Phones: stacked, 40 above and below, 16 title to text, 32 to the
 * full-width button (Figma); sizes unchanged (title 32/40, text 16/24 Grey_3).
 *
 * "Join Vegaz - Free" (decision 28 Oct; was "Join Vegaz") opens Login or signup (was "Add your event"). The whole hero
 * is hidden once signed in (pages/index.vue, decision 27 Oct). Copy exactly as in Figma (no full stop).
 */
const emit = defineEmits<{ join: [] }>()
</script>

<template>
  <section class="home-hero" aria-labelledby="home-hero-title">
    <div class="home-hero__inner">
      <h1 id="home-hero-title" class="home-hero__title text-hero-title">Meet people through meaningful experience</h1>
      <div class="home-hero__side">
        <p class="home-hero__text text-body-regular">
          Vegaz is your superpower for making friends and having a blast! Find your crew, plan epic activities, and create memories
        </p>
        <UiButton text-style="web" class="home-hero__button" @click="emit('join')">Join Vegaz - Free</UiButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ---- Phones (< 768px) ---- */
.home-hero { background: var(--color-background-secondary); }
.home-hero__inner {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md); /* 16 title to text */
  max-width: calc(var(--container-web-desktop-max) + 2 * var(--container-inset-desktop));
  margin-inline: auto;
  box-sizing: border-box;
  padding: var(--spacing-hero-block) var(--container-inset-mobile); /* 40 above and below */
}
.home-hero__title { margin: 0; color: var(--color-text-strong); }
.home-hero__side { display: flex; flex-direction: column; gap: var(--spacing-xl); min-width: 0; } /* 32 text to button */
.home-hero__text { margin: 0; color: var(--color-text-muted); }
.home-hero__button { width: 100%; }

/* ---- 768px and up ---- */
@media (min-width: 768px) {
  .home-hero__inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-xl);
    padding: var(--spacing-hero-block) var(--container-inset-tablet);
  }
  .home-hero__title { flex: 0 1 581px; }
  .home-hero__side { flex: 0 1 506px; gap: var(--spacing-lg); align-items: flex-start; } /* 24 text to button */
  .home-hero__text { color: var(--color-text-secondary); } /* Figma desktop: Grey_2 */
  .home-hero__button { width: auto; } /* Airbnb standard button: hugs its text (decision 27 Oct; was 240) */
}

/* ---- Desktop (>= 1024px): Figma HOME/DEFAULT ---- */
@media (min-width: 1024px) {
  .home-hero__inner { padding: 70px var(--container-inset-desktop); } /* Figma 70 above and below */
  .home-hero__title {
    font-size: 56px;
    line-height: 64px;
    letter-spacing: -1px;
  }
  .home-hero__text { font-size: 18px; line-height: 28px; letter-spacing: 0; }
}
</style>
