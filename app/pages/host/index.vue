<script setup lang="ts">
import '~/components/host/styles.css'
/**
 * Host an event: choice page (Figma frame "Fresh 01", 10789:19135).
 * Focused page (layouts/host.vue). Centred: "Create event" (H3 web bold) +
 * "How would you like to create your next event?" (Small web regular,
 * secondary), 32 above two option cards (360 x 180, 24 apart, 24 padding,
 * radius 16). Chosen card: Primary light 3 (#ECEFFE) with a 2px Primary
 * line; the other: white with a 1px Grey_5 line. Each card has its 32px icon
 * (Start fresh: Pen 2; Use existing: Restart Circle, updated by design 24 Oct).
 * Bottom bar: "Cancel" (back to Home) and "Continue".
 * Signed out: back to Home and the login opens; after login it returns here.
 */
definePageMeta({ layout: 'host', requiresAuth: true, footer: false })
useHead({ title: 'Create event · Vegaz' })

const { user } = useSession()
const { startHosting } = useHostEntry()
onMounted(() => {
  if (!user.value) { navigateTo('/', { replace: true }); startHosting(); return }
  // Phones use the "Create event" sheet (Figma mobile) over Home instead
  if (window.matchMedia('(max-width: 767px)').matches) { navigateTo('/', { replace: true }); startHosting() }
})

type Choice = 'fresh' | 'edition'
const choice = ref<Choice>('fresh')
const options: { id: Choice; title: string; description: string; icon: string }[] = [
  { id: 'fresh', title: 'Start fresh event', description: 'Create a brand new event', icon: '/images/host/icon-pen-32.svg' },
  { id: 'edition', title: 'Use existing event', description: 'An event with existing chat room and members, recommended for a new edition of an event', icon: '/images/host/icon-restart-32.svg' },
]
const go = () => navigateTo(choice.value === 'fresh' ? '/host/new' : '/host/edition')
// Cancel: back to the page they came from, or Home (decision 30 Oct)
function cancel() {
  if (window.history.state?.back) useRouter().back()
  else navigateTo('/')
}
</script>

<template>
  <HostFrame v-if="user" back-label="Cancel" :can-continue="true" @back="cancel" @continue="go">
    <div class="host-choice">
      <div class="host-step-head host-choice__head">
        <h1 class="host-step-head__title host-choice__h1">Create event</h1>
        <p class="host-step-head__copy text-small-regular">How would you like to create your next event?</p>
      </div>
      <div class="host-choice__options" role="radiogroup" aria-label="How would you like to create your next event?">
        <label v-for="o in options" :key="o.id" :class="['host-choice__card', { 'host-choice__card--on': choice === o.id }]">
          <input v-model="choice" class="host-visually-hidden" type="radio" name="host-choice" :value="o.id" />
          <img :src="o.icon" alt="" width="32" height="32" />
          <span class="host-choice__title text-small-semibold">{{ o.title }}</span>
          <span class="host-choice__copy text-xsmall-regular">{{ o.description }}</span>
        </label>
      </div>
    </div>
  </HostFrame>
</template>

<style scoped>
.host-choice { min-height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--spacing-xl); }
.host-choice__head { text-align: center; }
.host-choice__options { display: flex; gap: var(--spacing-lg); }
.host-choice__card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 360px;
  min-height: 180px;
  padding: calc(var(--spacing-lg) - 1px);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: 16px;
  background: var(--color-background-primary);
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease;
}
.host-choice__card:hover { border-color: var(--color-border-strong); }
.host-choice__card--on, .host-choice__card--on:hover { padding: calc(var(--spacing-lg) - 2px); border: var(--border-width-emphasis) solid var(--color-action-primary); background: var(--color-host-selected); }
.host-choice__card:has(input:focus-visible) { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }
.host-choice__title { color: var(--color-text-primary); font-weight: var(--font-weight-bold); } /* bold (decision 27 Oct) */
/* H2 32/40 bold (decision 27 Oct; was 20/24) */
.host-choice__h1 { font-family: var(--font-family-base); font-weight: var(--font-weight-bold); font-size: 32px; line-height: 40px; letter-spacing: -0.5px; }
.host-choice__copy { color: var(--color-text-secondary); }
/* Phones use the sheet over Home and are sent there on load: never paint this page first (decision 30 Oct) */
@media (max-width: 767px) { .host-choice { visibility: hidden; } }
@media (max-width: 767px) {
  .host-choice__options { flex-direction: column; width: 100%; }
  .host-choice__card { width: 100%; min-height: 0; }
}
</style>
