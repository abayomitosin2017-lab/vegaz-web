<script setup lang="ts">
// Default page shell: Figma header (node 9801:14593) and Footer (node 9864:56123).
// "Login or signup" (and the mobile profile icon) opens the onboarding modal;
// when signed in, the header shows the user and the profile menu.
// Pages can hide the footer with definePageMeta({ footer: false }) (chat).
const { open: openAuth } = useAuthModal()
const { user, logout } = useSession()
const route = useRoute()
// Phones: some screens (an open chat) use their own top bar instead
const hideHeaderOnPhone = useState('hide-header-phone', () => false)
// "Host an Event": log in first when signed out (decision 23 Oct)
const { startHosting, watchLogin } = useHostEntry()
watchLogin()

// Profile menu: "Chat" opens the chat page, "Log out" signs out (and leaves
// pages that need an account). Edit Profile, Settings and My Activities have
// no pages yet.
async function onMenu(id: string) {
  if (id === 'chat') await navigateTo('/chat')
  else if (id === 'logout') {
    await logout()
    if (route.meta.requiresAuth) await navigateTo('/')
  }
}
</script>

<template>
  <div class="layout">
    <LayoutHeader :class="{ 'layout__header--hide-phone': hideHeaderOnPhone }" :user="user" @login="openAuth" @menu="onMenu" @host="startHosting" />
    <main id="main" class="layout__main">
      <slot />
    </main>
    <LayoutFooter v-if="route.meta.footer !== false" />
    <AuthOnboardingModal />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.layout__main { flex: 1 0 auto; display: flex; flex-direction: column; }
@media (max-width: 767px) {
  .layout__header--hide-phone { display: none; }
}
</style>
