<script setup lang="ts">
/**
 * Error page for wrong links and crashes (decision 27 Oct; NOT IN FIGMA,
 * PROPOSED). Uses the normal header and footer.
 *   404: map pin with an X, "Page not found", "The link may be broken, or
 *        the page may have moved.", "Go to Home" + "Explore events".
 *   anything else: "Something went wrong", "Please try again in a moment.",
 *        "Try again" (reloads) + "Go to Home".
 * Same look as the other state messages (UiStateMessage).
 */
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)
useHead(() => ({ title: notFound.value ? 'Page not found · Vegaz' : 'Something went wrong · Vegaz' }))

const home = () => clearError({ redirect: '/' })
const explore = () => clearError({ redirect: '/events' })
function tryAgain() { window.location.reload() }
</script>

<template>
  <NuxtLayout>
    <div class="error-page">
      <UiStateMessage
        :icon="notFound ? '/images/states/icon-lost-32.svg' : '/images/states/icon-danger-32.svg'"
        :title="notFound ? 'Page not found' : 'Something went wrong'"
        :text="notFound ? 'The link may be broken, or the page may have moved.' : 'Please try again in a moment.'"
        :level="1"
      >
        <div class="error-page__actions">
          <UiButton v-if="notFound" text-style="web" @click="home">Go to Home</UiButton>
          <UiButton v-else text-style="web" @click="tryAgain">Try again</UiButton>
          <UiButton class="error-page__second" color="secondary" fill="ghost" text-style="web" @click="notFound ? explore() : home()">{{ notFound ? 'Explore events' : 'Go to Home' }}</UiButton>
        </div>
      </UiStateMessage>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.error-page { display: flex; flex: 1; align-items: center; justify-content: center; min-height: 60vh; padding: var(--spacing-2xl) var(--container-inset-mobile); }
.error-page__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--spacing-xs); margin-top: var(--spacing-lg); }
.error-page__second { --ui-button-border-color: transparent; }
</style>
