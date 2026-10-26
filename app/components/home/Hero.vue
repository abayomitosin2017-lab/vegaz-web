<script setup lang="ts">
/**
 * HomeHero: hero band of Home.
 *   - below 768px: HOME/DEFAULT/MOBILE (Figma 10653:39346), stacked
 *   - 768px and up: Desktop - 29 (Figma 9917:22307), text left, buttons right
 *     (768-1023 is the desktop layout squeezed; no tablet design in Figma)
 * Copy is exactly as in Figma (the sentence has no full stop there).
 * "Add your event" emits `add-event`, which opens Host an event (decision 23 Oct).
 * "Explore Events" was removed at every width (decision 26 Oct).
 */
const emit = defineEmits<{ 'add-event': [] }>()
</script>

<template>
  <section class="home-hero" aria-labelledby="home-hero-title">
    <div class="home-hero__inner">
      <div class="home-hero__copy">
        <h1 id="home-hero-title" class="home-hero__title text-hero-title">Meet people through meaningful experience</h1>
        <p class="home-hero__text text-body-regular">
          Vegaz is your superpower for making friends and having a blast! Find your crew, plan epic activities, and create memories
        </p>
      </div>
      <div class="home-hero__actions">
        <UiButton text-style="web" class="home-hero__button" @click="emit('add-event')">Add your event</UiButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ---- Mobile (< 768px) ---- */
.home-hero {
  background: var(--color-background-secondary);
}
.home-hero__inner {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
  max-width: 1440px;
  margin-inline: auto;
  /* Pixel-exact to Figma: content is 80px from top and bottom of the 480px band,
     20px from the left and 16px from the right.
     FLAG: right margin is 16, the rest of the page uses 20. */
  padding: var(--spacing-hero-block) var(--container-inset-mobile); /* 40 top and bottom (decision 26 Oct) */
}
.home-hero__copy {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-width: 0;
}
/* 32/40 bold on phones, 40/48 from 768 (decision 26 Oct) */
.home-hero__title { margin: 0; color: var(--color-text-strong); }
.home-hero__text { color: var(--color-text-muted); }
.home-hero__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.home-hero__button { width: 100%; }

/* ---- 768px and up ---- */
@media (min-width: 768px) {
  .home-hero__inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-xl); /* keeps text and buttons apart when squeezed */
    /* Squeezed desktop layout: same vertical spacing as 1440, 32px sides */
    padding: var(--spacing-hero-block) var(--container-inset-tablet);
  }
  .home-hero__copy {
    flex: 0 1 581px;
    gap: var(--spacing-md); /* 16 between title and text (decision 26 Oct) */
  }
  .home-hero__actions {
    flex: none;
    gap: var(--spacing-xs);
    /* fits the longer button (Airbnb 24 side padding); both share its width */
    width: max-content;
  }
}

@media (min-width: 1024px) {
  .home-hero__inner {
    /* 40 top and bottom (decision 26 Oct), page margins at the sides */
    padding: var(--spacing-hero-block) var(--container-inset-desktop);
  }
}
</style>
