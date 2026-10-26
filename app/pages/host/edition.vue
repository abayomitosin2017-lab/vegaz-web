<script setup lang="ts">
/**
 * Host an event: New edition flow (Figma edition frames 01-06).
 * Focused page (layouts/host.vue); the steps live in HostFlow.
 * Signed out: back to Home and the login opens; after login the host
 * flow opens again (from its first page).
 */
definePageMeta({ layout: 'host', requiresAuth: true, footer: false })
useHead({ title: 'Create new edition · Vegaz' })

const { user } = useSession()
const { startHosting } = useHostEntry()
onMounted(() => {
  if (!user.value) { navigateTo('/'); startHosting() }
})
</script>

<template>
  <HostFlow v-if="user" mode="edition" />
</template>
