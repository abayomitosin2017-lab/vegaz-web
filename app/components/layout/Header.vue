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
 *   - desktop: "Host an Event" + profile button (avatar, name, @username,
 *     down arrow); the logo frame is 374px wide so the search stays centred
 *   - mobile: search icon button + 40px avatar button
 *   Both open the profile menu (UiDropdownMenu, Figma 10653:40453).
 *
 * Search (LayoutSearchBox): typing shows matching events in a list under
 * the field; choosing one opens its page (decision 22 Oct; results page not
 * designed). Phones (decision 21 Oct, not in Figma): tapping the search icon
 * turns the bar into the search field (48px tall so the bar stays 80px) and a
 * "Cancel" text button. Escape or Cancel closes it and puts focus back on the
 * icon; it also closes when the page changes.
 *
 * Emits `host`, `login` and `menu` (profile menu item id).
 */
import type { SessionUser } from '~/types/auth'
import { profileMenuItems } from '~/config/profileMenu'

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


// Phones: the search icon opens a search bar in the header
const mobileSearchOpen = ref(false)
const mobileSearchBox = ref<{ focus: () => void } | null>(null)
const mobileSearchButton = ref<{ $el: HTMLElement } | null>(null)
async function openMobileSearch() {
  mobileSearchOpen.value = true
  await nextTick()
  mobileSearchBox.value?.focus()
}
async function closeMobileSearch() {
  mobileSearchOpen.value = false
  await nextTick()
  mobileSearchButton.value?.$el?.focus()
}
function onMobileSearchKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.preventDefault(); closeMobileSearch() }
}
const route = useRoute()
watch(() => route.fullPath, () => { mobileSearchOpen.value = false })
</script>

<template>
  <header ref="root" class="site-header">
    <!-- Mobile variant (< 768px) -->
    <div class="site-header__bar site-header__bar--mobile">
      <!-- Search open: field + Cancel fill the bar -->
      <div v-if="mobileSearchOpen" class="site-header__mobile-search" @keydown="onMobileSearchKey">
        <LayoutSearchBox ref="mobileSearchBox" @chosen="mobileSearchOpen = false" />
        <UiButton fill="ghost" color="secondary" text-style="web" class="site-header__search-cancel" @click="closeMobileSearch">Cancel</UiButton>
      </div>
      <template v-else>
      <NuxtLink to="/" class="site-header__logo-link" aria-label="Vegaz home">
        <img class="site-header__logo" src="/images/logo-header.svg" alt="Vegaz" width="85" height="36" />
      </NuxtLink>
      <div v-if="showActions" class="site-header__icons">
        <!-- Figma: Grey_6 round icon buttons, 12px padding, no border (48 x 48) -->
        <UiButton
          color="secondary"
          icon-only
          ref="mobileSearchButton"
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
          <template #icon><img src="/images/icon-profile-24.svg" alt="" width="24" height="24" /></template>
        </UiButton>
        <UiDropdownMenu v-else :items="profileMenuItems" label="Account" @select="emit('menu', $event)">
          <template #trigger="{ props: trigger }">
            <button type="button" class="site-header__avatar-button" :aria-label="accountLabel" data-account-trigger v-bind="trigger">
              <UiAvatar :name="user.firstName" :seed="user.username" :src="user.avatarUrl" />
            </button>
          </template>
        </UiDropdownMenu>
      </div>
      </template>
    </div>

    <!-- Default variant (>= 768px) -->
    <div :class="['site-header__bar', 'site-header__bar--desktop', { 'site-header__bar--signed-in': user }]">
      <!-- Figma keeps the logo in a 355px (signed out) / 374px (signed in) frame,
           as wide as the actions on the right, so the search sits centred -->
      <div class="site-header__brand">
        <NuxtLink to="/" class="site-header__logo-link" aria-label="Vegaz home">
          <img class="site-header__logo" src="/images/logo-header.svg" alt="Vegaz" width="85" height="36" />
        </NuxtLink>
      </div>

      <LayoutSearchBox class="site-header__search" />

      <div v-if="showActions" class="site-header__actions">
        <!-- Figma instance uses 32px side padding on this ghost button -->
        <UiButton fill="ghost" color="secondary" style="--ui-button-pad-x: var(--spacing-xl)" @click="emit('host')">
          Host an Event
        </UiButton>
        <UiButton v-if="!user" fill="solid" color="secondary" data-login @click="emit('login')">Login or signup</UiButton>
        <UiDropdownMenu v-else :items="profileMenuItems" label="Account" @select="emit('menu', $event)">
          <template #trigger="{ props: trigger }">
            <button type="button" class="site-header__profile" :aria-label="accountLabel" data-account-trigger v-bind="trigger">
              <span class="site-header__who">
                <UiAvatar :name="user.firstName" :seed="user.username" :src="user.avatarUrl" />
                <span class="site-header__names">
                  <span class="site-header__name text-small-semibold">{{ fullName }}</span>
                  <span class="site-header__handle text-xsmall-regular">@{{ user.username }}</span>
                </span>
              </span>
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
.site-header__bar--mobile {
  padding: var(--spacing-md) var(--spacing-md) calc(var(--spacing-md) - var(--border-width-default));
}
.site-header__icons {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
.site-header__mobile-search {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}
.site-header__mobile-search > :first-child { flex: 1; min-width: 0; }
/* 48px tall like the icon buttons, so the bar stays 80px */
.site-header__mobile-search :deep(.ui-input) {
  min-height: var(--sizing-control-standard);
  /* 36px search button centred in 48px: 6px above and below, minus the 1px line */
  padding-block: calc((var(--sizing-control-standard) - 36px) / 2 - var(--border-width-default));
}
.site-header__search-cancel { flex: none; --ui-button-pad-x: var(--spacing-xs); }
.site-header__icon-button {
  --ui-button-pad-x: var(--spacing-sm);
  --ui-button-border-color: transparent;
}
.site-header__bar--desktop { display: none; }

/* ---- Default variant (>= 768px): Figma 18px top/bottom, 64px sides,
   1px border inside the 88px frame (bottom padding 18 - 1) ---- */
@media (min-width: 768px) {
  .site-header__bar--mobile { display: none; }
  .site-header__bar--desktop {
    display: flex;
    gap: var(--spacing-md); /* keeps items apart when squeezed (not in Figma at 1440) */
    padding: 18px var(--container-inset-tablet) calc(18px - var(--border-width-default));
  }
}
@media (min-width: 1024px) {
  .site-header__bar--desktop {
    padding-inline: var(--container-inset-desktop);
  }
}

.site-header__brand {
  /* shrinks before the search field when squeezed (768-1439) */
  flex: 0 100 355px;
  height: 36px;
  min-width: 85px;
}
.site-header__bar--signed-in .site-header__brand { flex-basis: 374px; }
.site-header__logo-link { display: inline-block; border-radius: var(--radius-xs); color: inherit; }
.site-header__logo-link:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
/* Figma logo frame: 85 x 35.962 */
.site-header__logo { width: 85px; height: 35.962px; }

.site-header__search { flex: 0 1 376px; min-width: 0; }

.site-header__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: none;
}

/* ---- Signed in ---- */
/* Mobile: 40px avatar is the menu button (Figma: avatar at 4px inside a 48px row).
   FLAG: 40px is below the 44px recommended tap size. */
.site-header__avatar-button {
  display: inline-flex;
  padding: 0;
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
  gap: var(--spacing-md);
  padding: var(--spacing-xxs) var(--spacing-md) var(--spacing-xxs) var(--spacing-xxs);
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
.site-header__who { display: flex; align-items: center; gap: var(--spacing-xs); min-width: 0; }
.site-header__names { display: flex; flex-direction: column; min-width: 0; }
/* Long names end in "..." (not in Figma; FLAG) */
.site-header__name,
.site-header__handle {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.site-header__name { color: var(--color-text-primary); }
.site-header__handle { color: var(--color-text-muted); }
.site-header__arrow { flex: none; width: 16px; height: 16px; }
.site-header__avatar-button:focus-visible,
.site-header__profile:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
</style>
