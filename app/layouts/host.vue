<script setup lang="ts">
/**
 * Host an event: focused page shell (decision 23 Oct, Figma desktop frames
 * in section 10754:68066). No site header or footer, only a slim top bar:
 * Vegaz logo on the left, "Exit" on the right.
 *
 * Top bar: 72px tall, 0 64px padding, 1px Grey_5 line below. Logo 78 x 33.
 * Exit: small secondary button, 96px wide; leaves the flow for Home.
 * OPEN ITEM (design): ask before leaving with unsaved changes? Not drawn.
 * Phones: no top bar (mobile Figma frames); see HostFlow.
 */
</script>

<template>
  <div class="host-layout">
    <header class="host-layout__bar">
      <NuxtLink to="/" class="host-layout__logo-link" aria-label="Vegaz home">
        <img src="/images/logo-header.svg" alt="Vegaz" width="78" height="33" />
      </NuxtLink>
      <UiButton class="host-layout__exit" size="small" color="secondary" @click="navigateTo('/')">Exit</UiButton>
    </header>
    <main id="main" class="host-layout__main">
      <slot />
    </main>
    <AuthOnboardingModal />
  </div>
</template>

<style scoped>
.host-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: var(--color-background-primary);
}
.host-layout__bar {
  flex: none;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--sizing-host-topbar);
  padding: 0 var(--spacing-4xl);
  border-bottom: var(--border-width-default) solid var(--color-border-default);
}
.host-layout__logo-link { display: inline-flex; border-radius: var(--radius-xs); }
.host-layout__logo-link:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }
.host-layout__logo-link img { display: block; width: auto; height: var(--sizing-logo-height); } /* Airbnb logo height 32 */
.host-layout__main { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }

/* Phones: the mobile Figma screens have no logo bar; each screen has its
   own back button (HostMobileTopBar) */
@media (max-width: 767px) {
  .host-layout__bar { display: none; }
}
</style>
