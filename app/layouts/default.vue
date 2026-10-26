<script setup lang="ts">
// Default page shell: Figma header (node 9801:14593) and Footer (node 9864:56123).
// "Login or signup" (and the mobile profile icon) opens the onboarding modal;
// when signed in, the header shows the user and the profile menu.
// Pages can hide the footer with definePageMeta({ footer: false }) (chat),
// or only on phones with footer: 'desktop' (Edit Profile).
const { open: openAuth } = useAuthModal()
const { user, logout } = useSession()
const route = useRoute()
// Phones: some screens (an open chat) use their own top bar instead
const hideHeaderOnPhone = useState('hide-header-phone', () => false)
// Birthday / gender prompts after login (decision 26 Oct). Set up before
// the host entry below so it sees a pending "Host an Event" login.
const prompts = useProfilePrompts()
// "Host an Event": log in first when signed out (decision 23 Oct)
const { startHosting, watchLogin, sheetOpen: hostSheetOpen } = useHostEntry()
watchLogin()

// Profile menu: "Edit Profile" opens /profile/edit, "Chat" the chat page,
// "My Activities" the Activities modal (full screen on phones); "Log out"
// asks first (Figma 10834:26385), then signs out and leaves pages that
// need an account.
const logoutOpen = ref(false)
const loggingOut = ref(false)
const activitiesOpen = useState('activities-open', () => false)
async function onMenu(id: string) {
  if (id === 'chat') await navigateTo('/chat')
  else if (id === 'edit-profile') await navigateTo('/profile/edit')
  else if (id === 'activities') activitiesOpen.value = true
  else if (id === 'logout') logoutOpen.value = true
}
async function confirmLogout() {
  loggingOut.value = true
  try {
    await logout()
    logoutOpen.value = false
    if (route.meta.requiresAuth) await navigateTo('/')
  } finally {
    loggingOut.value = false
  }
}
// Chat dock (decision 26 Oct): forget its chats and state on log out
const chatDock = useChatDock()
watch(user, (u, was) => { if (!u && was) { chatDock.reset(); try { sessionStorage.removeItem('vegaz-chat-dock') } catch { /* ignore */ } } })
// Phone bottom navigation (Figma 10870:35376, decision 26 Oct): on the main
// pages; hidden on event pages (their ticket bar sits there), inside an open
// conversation and on full-screen phone screens. Edit Profile keeps it (its
// Save bar sits above it).
const isPhone = usePhoneLayout()
const showBottomNav = computed(() => isPhone.value
  && !route.path.startsWith('/events/')
  && !(route.path === '/chat' && route.query.chat)
  && (!hideHeaderOnPhone.value || route.path === '/profile/edit'))
</script>

<template>
  <div :class="['layout', { 'layout--bottom-nav': showBottomNav }]">
    <LayoutHeader :class="{ 'layout__header--hide-phone': hideHeaderOnPhone }" :user="user" @login="openAuth" @menu="onMenu" @host="startHosting" />
    <main id="main" class="layout__main">
      <slot />
    </main>
    <LayoutFooter v-if="route.meta.footer !== false" :class="{ 'layout__footer--hide-phone': route.meta.footer === 'desktop' }" />
    <LayoutBottomNav v-if="showBottomNav" />
    <AuthOnboardingModal />
    <AuthLogoutDialog :open="logoutOpen" :busy="loggingOut" @close="logoutOpen = false" @confirm="confirmLogout" />
    <HostChoiceSheet :open="hostSheetOpen" @close="hostSheetOpen = false" />
    <ProfileActivitiesModal :open="activitiesOpen" @close="activitiesOpen = false" @host="startHosting" />
    <ProfileBirthdayPrompt :open="prompts.prompt.value === 'birthday'" :busy="prompts.busy.value" @close="prompts.close" @save="prompts.onBirthday" />
    <ClientOnly><ChatDock v-if="user && route.path !== '/chat'" /></ClientOnly>
    <ProfileGenderPrompt :open="prompts.prompt.value === 'gender'" :busy="prompts.busy.value" :initial="user?.gender" @close="prompts.close" @save="prompts.onGender" />
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
  .layout__header--hide-phone, .layout__footer--hide-phone { display: none; }
  /* room for the fixed bottom navigation */
  .layout--bottom-nav { padding-bottom: calc(var(--sizing-bottom-nav) + env(safe-area-inset-bottom, 0px)); }
}
</style>
