<script setup lang="ts">
/**
 * LayoutHeader: Figma "header" component (node 9801:14593), signed-out and signed-in states.
 *
 * Two Figma variants, switched by screen width:
 *   - below 768px: mobile variant (HOME/DEFAULT/MOBILE): logo + round search
 *     and profile icon buttons, 80px tall.
 *   - 768px and up: default variant (Desktop - 29): logo, search field,
 *     "Host an Event" and "Login or signup". 768-1023 is the same layout
 *     squeezed (no tablet design in Figma), with 32px side margins.
 * From 1440px the content stops growing and stays centred (1312px wide).
 * Sticky: stays at the top of the screen while the page scrolls.
 *
 * Signed in (`user` set; Figma HOME/LOGGED IN 10653:39743 and
 * HOME/LOGGED IN/MOBILE 10653:39803):
 *   - desktop: "Add your Event" + profile button (avatar and name only,
 *     the @username line removed 27 Oct;
 *     down arrow); the logo frame is 374px wide so the search stays centred
 *   - mobile: search icon button + 32px avatar button (was 40) with the desktop
 *     down arrow beside it (decision 22 Oct)
 *   Both open the profile menu (UiDropdownMenu, Figma 10653:40453).
 *
 * Search (LayoutSearchBox): typing shows matching events in a list under
 * the field; choosing one opens its page (decision 22 Oct; results page not
 * designed). Phones (decision 27 Oct, replaces the in-bar field with
 * "Cancel"): tapping the search icon opens a full-screen search with a close
 * X and suggested events (LayoutMobileSearch).
 *
 * Emits `host`, `login` and `menu` (profile menu item id).
 */
import type { SessionUser } from '~/types/auth'
import { profileMenuItems } from '~/config/profileMenu'
import type { DropdownItem } from '~/components/ui/DropdownMenu.vue'

const props = withDefaults(defineProps<{ showActions?: boolean; user?: SessionUser | null }>(), { showActions: true, user: null })

const emit = defineEmits<{ host: []; login: []; menu: [id: string] }>()

const fullName = computed(() => (props.user ? `${props.user.firstName} ${props.user.lastName}`.trim() : ''))
// After logging out, put keyboard focus on the visible "Login or signup" button
const root = ref<HTMLElement | null>(null)
watch(() => props.user, async (now, before) => {
  if (now || !before || !import.meta.client) return
  await nextTick()
  const buttons = [...(root.value?.querySelectorAll<HTMLElement>('[data-login]') ?? [])]
  buttons.find(b => b.offsetParent !== null)?.focus()
})

const accountLabel = computed(() => (props.user ? `Account menu, ${fullName.value} @${props.user.username}` : ''))


// Phones: the search icon opens the full-screen search (decision 27 Oct)
const mobileSearchOpen = ref(false)
function openMobileSearch() { mobileSearchOpen.value = true }
function closeMobileSearch() { mobileSearchOpen.value = false }
const route = useRoute()
watch(() => route.fullPath, () => { mobileSearchOpen.value = false })
// Phones: Chat lives in the bottom navigation (with its unread count), so
// the phone menu is Edit Profile, My Activities, Log out (decision 26 Oct)
const mobileMenuItems = computed<DropdownItem[]>(() => profileMenuItems.filter(i => i.id !== 'chat'))
</script>

<template>
  <header ref="root" class="site-header">
    <!-- Mobile variant (< 768px) -->
    <div class="site-header__bar site-header__bar--mobile">
      <NuxtLink to="/" class="site-header__logo-link" aria-label="Vegaz home">
        <img class="site-header__logo" src="/images/logo-header.svg" alt="Vegaz" width="85" height="36" />
      </NuxtLink>
      <div v-if="showActions" class="site-header__icons">
        <!-- Airbnb header round buttons: 40 x 40; icons 24 (Figma, decision 27 Oct); login: Figma user icon -->
        <UiButton
          color="secondary"
          icon-only
          aria-label="Search for events"
          class="site-header__icon-button"
          @click="openMobileSearch"
        >
          <template #icon><img src="/images/icon-search-24.svg" alt="" width="24" height="24" /></template>
        </UiButton>
        <UiButton
          v-if="!user"
          color="secondary"
          icon-only
          aria-label="Login or signup"
          class="site-header__icon-button"
          data-login
          @click="emit('login')"
        >
          <template #icon><img src="/images/icon-user-24.svg" alt="" width="24" height="24" /></template>
        </UiButton>
        <UiDropdownMenu v-else :items="mobileMenuItems" label="Account" @select="emit('menu', $event)">
          <template #trigger="{ props: trigger }">
            <button type="button" class="site-header__avatar-button" :aria-label="accountLabel" data-account-trigger v-bind="trigger">
              <UiAvatar :name="user.firstName" :seed="user.username" :src="user.avatarUrl" :size="28" /><!-- 28: a filled photo reads as the same size as the 24 outline search icon (decision 27 Oct) -->
              <img class="site-header__arrow" src="/images/icon-arrow-down-16.svg" alt="" width="16" height="16" />
            </button>
          </template>
        </UiDropdownMenu>
      </div>
    </div>
    <!-- Phones: the search icon opens the full-screen search (decision 27 Oct) -->
    <LayoutMobileSearch :open="mobileSearchOpen" @close="closeMobileSearch" />

    <!-- Default variant (>= 768px) -->
    <div :class="['site-header__bar', 'site-header__bar--desktop', { 'site-header__bar--signed-in': user }]">
      <!-- Logo, search exactly centred, actions (equal side columns) -->
      <div class="site-header__brand">
        <NuxtLink to="/" class="site-header__logo-link" aria-label="Vegaz home">
          <img class="site-header__logo" src="/images/logo-header.svg" alt="Vegaz" width="85" height="36" />
        </NuxtLink>
      </div>

      <LayoutSearchBox class="site-header__search" />

      <div v-if="showActions" class="site-header__actions">
        <!-- Airbnb "Become a host": 40 tall pill, 11 / 12 padding, 14/18 w500 -->
        <UiButton size="small" fill="ghost" color="secondary" @click="emit('host')">
          Add your Event
        </UiButton>
        <UiButton v-if="!user" size="small" fill="solid" color="secondary" data-login @click="emit('login')">Login or signup</UiButton>
        <UiDropdownMenu v-else :items="profileMenuItems" label="Account" @select="emit('menu', $event)">
          <template #trigger="{ props: trigger }">
            <button type="button" class="site-header__profile" :aria-label="accountLabel" data-account-trigger v-bind="trigger">
              <!-- Photo only (decision 27 Oct): 32 photo + arrow, 40 tall like "Add your Event" -->
              <UiAvatar :name="user.firstName" :seed="user.username" :src="user.avatarUrl" :size="32" />
              <img class="site-header__arrow" src="/images/icon-arrow-down-16.svg" alt="" width="16" height="16" />
            </button>
          </template>
        </UiDropdownMenu>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  /* Stays fixed to the top of the screen while the page scrolls (decision;
     Figma frames are static). Sits above cards and banners. */
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: var(--border-width-default) solid var(--color-border-default);
  background: var(--color-background-primary);
}

.site-header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 1440 = 1312 content + 2 x 64 margins: stays centred on wider screens */
  max-width: calc(var(--container-web-desktop-max) + 2 * var(--container-inset-desktop));
  margin-inline: auto;
}

/* ---- Mobile (< 768px): Figma 16px all round; the 1px bottom border sits
   inside the 80px frame, so bottom padding is 16 - 1 ---- */
/* Airbnb: 80 tall bar (1px line included), page margin 24 */
.site-header__bar--mobile {
  box-sizing: border-box;
  height: calc(var(--sizing-header-height) - var(--border-width-default));
  padding: 10px var(--container-inset-mobile); /* same 10 above / below as the bottom navigation (decision 27 Oct) */
}
.site-header__icons {
  display: flex;
  align-items: center;
  /* Icons only now (decision 27 Oct): the 40 tap areas sit 4 apart, so the
     icons themselves are 20 apart; the last icon lines up with the page edge */
  gap: var(--spacing-xxs);
  margin-right: calc(-1 * var(--spacing-xs));
}
.site-header__icon-button {
  --ui-button-min-height: var(--sizing-icon-button-md);
  --ui-button-pad-y: var(--spacing-xs);
  --ui-button-pad-x: var(--spacing-xs);
  --ui-button-border-color: transparent;
}
/* Just the icon, no grey circle (decision 27 Oct) */
.site-header .site-header__icon-button,
.site-header .site-header__icon-button:hover,
.site-header .site-header__icon-button:active { background: transparent; }
.site-header__bar--desktop { display: none; }

/* ---- Default variant (>= 768px): Figma 18px top/bottom, 64px sides,
   now Airbnb 80 tall ---- */
@media (min-width: 768px) {
  .site-header__bar--mobile { display: none; }
  .site-header__bar--desktop {
    /* Search exactly in the middle of the page (decision 27 Oct): two equal
       side columns, logo left, actions right */
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 509px) minmax(0, 1fr);
    gap: var(--spacing-md); /* keeps items apart when squeezed (not in Figma at 1440) */
    /* Airbnb compact header: 80 tall (1px line included) */
    box-sizing: border-box;
    height: calc(var(--sizing-header-height) - var(--border-width-default));
    padding: 0 var(--container-inset-tablet);
  }
}
@media (min-width: 1024px) {
  .site-header__bar--desktop {
    padding-inline: var(--container-inset-desktop);
  }
}

.site-header__brand { justify-self: start; height: var(--sizing-logo-height); min-width: 76px; }
.site-header__logo-link { display: inline-block; border-radius: var(--radius-xs); color: inherit; }
.site-header__logo-link:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
/* Airbnb logo height: 32 (Vegaz logo kept, 85 x 35.962 scaled to 32 tall) */
.site-header__logo { display: block; width: auto; height: var(--sizing-logo-height); }

.site-header__search { min-width: 0; }
/* Search field sized as in Figma (HOME/DEFAULT 10847:29392, decision 27 Oct):
   509 wide, 52 tall, 18 to the placeholder, placeholder 16/24 Grey_3 (Figma 18), 32
   purple button with a 16 icon, 10 from the right */
.site-header__search :deep(.ui-input) {
  padding: calc(10px - var(--border-width-default)) calc(10px - var(--border-width-default)) calc(10px - var(--border-width-default)) calc(18px - var(--border-width-default));
  font-size: 16px; /* decision 27 Oct (Figma 18) */
  line-height: 24px;
  letter-spacing: 0;
}
.site-header__search :deep(.ui-input__field)::placeholder { color: var(--color-text-muted); }
.site-header__search :deep(.ui-input__action) { width: 32px; height: 32px; }

.site-header__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  justify-self: end;
}

/* ---- Signed in ---- */
/* Mobile: 40px avatar + the desktop down arrow is the menu button (Figma:
   avatar at 4px inside a 48px row; arrow added by decision 22 Oct, 4px gap,
   proposed). The arrow also widens the tap area past 44px. */
.site-header__avatar-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  min-height: 40px;
  padding: 0 var(--spacing-xs) 0 var(--spacing-xs); /* same 8 as the icon buttons */
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  cursor: pointer;
}
/* Desktop profile button (Figma 9801:14578): Grey_6 pill, 0.5px Grey_5 border
   inside, 4px around the avatar, 16px on the right; 16px between the
   avatar+names group and the arrow, 8px between avatar and names. 50px tall. */
.site-header__profile {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xxs) var(--spacing-sm) var(--spacing-xxs) var(--spacing-xxs); /* 4 + 32 photo + 4 = 40 tall */
  border: 0;
  /* 0.5px hairline drawn as a shadow: browsers round a 0.5px border up to 1px
     in layout, which would make the button 51px instead of Figma's 50 */
  box-shadow: inset 0 0 0 0.5px var(--color-border-default);
  border-radius: var(--radius-pill);
  background: var(--color-action-secondary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.site-header__profile:hover,
.site-header__profile[aria-expanded='true'] { background: var(--color-background-neutral); } /* proposed: Grey_5 */
.site-header__arrow { flex: none; width: 16px; height: 16px; }
.site-header__avatar-button:focus-visible,
.site-header__profile:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
</style>
