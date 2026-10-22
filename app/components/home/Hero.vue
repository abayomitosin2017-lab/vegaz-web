<script setup lang="ts">
/**
 * HomeHero: hero band of Home.
 *   - below 768px: HOME/DEFAULT/MOBILE (Figma 10653:39346), stacked
 *   - 768px and up: Desktop - 29 (Figma 9917:22307), text left, buttons right
 *     (768-1023 is the desktop layout squeezed; no tablet design in Figma)
 * Copy is exactly as in Figma (the sentence has no full stop there).
 * Buttons emit `add-event` and `explore`; Home sends `explore` to the All
 * events page (decision 22 Oct); `add-event` has no destination yet.
 */
const emit = defineEmits<{ 'add-event': []; explore: [] }>()
</script>

<template>
  <section class="home-hero" aria-labelledby="home-hero-title">
    <div class="home-hero__inner">
      <div class="home-hero__copy">
        <h1 id="home-hero-title" class="home-hero__title text-h1-bold">Meet people through meaningful experience</h1>
        <p class="home-hero__text text-body-regular">
          Vegaz is your superpower for making friends and having a blast! Find your crew, plan epic activities, and create memories
        </p>
      </div>
      <div class="home-hero__actions">
        <UiButton text-style="web" class="home-hero__button" @click="emit('add-event')">Add your event</UiButton>
        <!-- Figma instance: Grey_3 border instead of the component's Grey_5 -->
        <UiButton
          color="secondary"
          text-style="web"
          class="home-hero__button"
          style="--ui-button-border-color: var(--color-border-stronger)"
          @click="emit('explore')"
        >
          Explore Events
        </UiButton>
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
  padding: 80px var(--spacing-md) 80px var(--container-inset-mobile);
}
.home-hero__copy {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-width: 0;
}
/* FLAG: Figma mobile heading is 32px on a 40px line height; the Headline 1
   token is 32/48 below 1024px. Figma value used below 1024px. */
.home-hero__title { color: var(--color-text-strong); line-height: var(--text-hero-title-line); }
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
    padding: 59px var(--container-inset-tablet) var(--spacing-4xl);
  }
  .home-hero__copy {
    flex: 0 1 581px;
    gap: var(--spacing-lg);
  }
  .home-hero__actions {
    flex: none;
    gap: var(--spacing-xs);
    width: 238px;
  }
}

@media (min-width: 1024px) {
  .home-hero__inner {
    /* Pixel-exact to Figma HOME/DEFAULT at 1440: the 328px band starts 5px
       under the 88px header, so content is 59px below the header and 64px above
       the band's bottom; 58px from both sides.
       FLAG: 58 / 59 are off the spacing scale (64 expected). */
    padding: 59px 58px var(--spacing-4xl);
  }
}
</style>
