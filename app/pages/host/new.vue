<script setup lang="ts">
/**
 * Host an event: Fresh event flow (Figma frames 02-20).
 * Focused page (layouts/host.vue); the steps live in HostFlow.
 * Signed out: back to Home and the login opens; after login the host
 * flow opens again (from its first page).
 */
definePageMeta({ layout: 'host', requiresAuth: true, footer: false })
useHead({ title: 'Create new event · Vegaz' })

const { user } = useSession()
const { startHosting } = useHostEntry()
onMounted(() => {
  if (!user.value) { navigateTo('/'); startHosting() }
})
</script>

<template>
  <HostFlow v-if="user" mode="fresh" />
</template>
