<script setup lang="ts">
/**
 * Phone bottom navigation (Figma 10870:35376 content; Airbnb sizing, decision
 * 26 Oct). Phones only (< 768px). White bar, 1px black/10 line on top, 10
 * above and below the tabs (plus the phone's safe area); 65 tall. Tabs 44
 * tall, 3 top padding, icon 24, 5 gap, as measured on airbnb.com; label
 * 11/13 (decision 26 Oct), 0.2 letter spacing, semibold in every state
 * (Figma update 27 Oct; Figma's 12/18 size not taken, 11 kept). Items hug their
 * content and sit 64 apart, centred (Figma update 26 Oct):
 * - Explore (Figma update 26 Oct, was Home): Compass icon 24, Linear; Grey_3,
 *   Primary when active (Figma update 27 Oct: no Bold icon); goes to Home
 * - Create: Primary pill (Figma update 27 Oct, was #24044D), 24 / 4 padding,
 *   light purple (#F1E9FF) + 16; opens Host an Event (logs in first)
 * - Chat: Chat Round Dots 24, Linear; Grey_3, Primary when active; red
 *   unread count.
 *   Signed out it asks to log in first, like the Chat page.
 * Colours from Figma: Grey_3, Primary when active, Grey_1 for Create.
 * Active: Explore on Home and All events, Chat on the Chat page.
 * Hidden (by the layout) inside an open conversation, on event pages and
 * while full-screen screens hide the phone header.
 */
const route = useRoute()
const { startHosting } = useHostEntry()
const { unread } = useChatDock()
const { user } = useSession()
const homeOn = computed(() => route.path === '/' || route.path === '/events')
const chatOn = computed(() => route.path === '/chat')
const count = computed(() => (user.value && unread.value ? (unread.value > 99 ? '99+' : String(unread.value)) : ''))
</script>

<template>
  <nav class="bottom-nav" aria-label="Main">
    <ul class="bottom-nav__list">
      <li>
        <NuxtLink to="/" :class="['bottom-nav__item', { 'bottom-nav__item--on': homeOn }]" :aria-current="homeOn ? 'page' : undefined">
          <img :src="homeOn ? '/images/nav/icon-explore-active-24.svg' : '/images/nav/icon-explore-24.svg'" alt="" width="24" height="24" />
          <span class="bottom-nav__label">Explore</span>
        </NuxtLink>
      </li>
      <li>
        <button type="button" class="bottom-nav__item bottom-nav__item--create" @click="startHosting">
          <span class="bottom-nav__pill"><img src="/images/nav/icon-add-16.svg" alt="" width="16" height="16" /></span>
          <span class="bottom-nav__label">Create</span>
        </button>
      </li>
      <li>
        <NuxtLink to="/chat" :class="['bottom-nav__item', { 'bottom-nav__item--on': chatOn }]" :aria-current="chatOn ? 'page' : undefined">
          <span class="bottom-nav__icon">
            <img :src="chatOn ? '/images/nav/icon-chat-active-24.svg' : '/images/nav/icon-chat-24.svg'" alt="" width="24" height="24" />
            <span v-if="count" class="bottom-nav__count"><span class="bottom-nav__sr">, </span>{{ count }}<span class="bottom-nav__sr"> unread</span></span>
          </span>
          <span class="bottom-nav__label">Chat</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  inset: auto 0 0;
  z-index: 50; /* above page content, under the header menus and modals */
  box-sizing: border-box;
  padding: 10px var(--spacing-xxs) calc(10px + env(safe-area-inset-bottom, 0px)); /* Airbnb */
  height: calc(var(--sizing-bottom-nav) + env(safe-area-inset-bottom, 0px));
  border-top: var(--border-width-default) solid rgba(25, 27, 31, 0.1); /* Figma black/10 */
  background: var(--color-background-primary);
}
.bottom-nav__list { display: flex; align-items: flex-start; justify-content: center; gap: var(--spacing-4xl); margin: 0; padding: 0; list-style: none; } /* Figma: 64 between items */
.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  box-sizing: border-box;
  height: 44px; /* Airbnb tab height */
  padding: 3px 0 0;
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-text-muted);
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.bottom-nav__item:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 4px; }
.bottom-nav__item--on { color: var(--color-action-primary); }
.bottom-nav__item--create { color: var(--color-text-strong); }
.bottom-nav__label { font-family: var(--font-family-base); font-weight: var(--font-weight-semibold); /* Figma: semibold in every state (27 Oct) */ font-size: var(--text-nav-label-size); line-height: var(--text-nav-label-line); letter-spacing: var(--text-nav-label-tracking); white-space: nowrap; }
.bottom-nav__pill { display: inline-flex; align-items: center; justify-content: center; padding: var(--spacing-xxs) var(--spacing-lg); border-radius: var(--radius-pill); background: var(--color-action-primary); } /* Figma update 27 Oct: Primary (was #24044D) */
.bottom-nav__icon { position: relative; display: inline-flex; }
.bottom-nav__count {
  position: absolute;
  top: -6px;
  left: 14px;
  box-sizing: border-box;
  min-width: 18px;
  height: 18px;
  padding: 0 var(--spacing-xxs);
  border: 2px solid var(--color-background-primary);
  border-radius: var(--radius-pill);
  background: var(--color-status-error);
  color: var(--base-white);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-sub-regular-size);
  line-height: 14px;
  text-align: center;
}
.bottom-nav__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (min-width: 768px) { .bottom-nav { display: none; } }
</style>
