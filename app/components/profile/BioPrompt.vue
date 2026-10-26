<script setup lang="ts">
import './styles.css'
import { BIO_MAX_WORDS, capWords, countWords } from '~/services/profile'
/**
 * "Introduce yourself" (decision 26 Oct; NOT IN FIGMA, PROPOSED layout).
 * Opens when someone joins an event's chat for the first time and has no
 * bio. Their bio becomes the automatic hello in the chat ("Hi everyone, my
 * name is {first name} and {bio}"), with their main profile photo.
 * Same frame as the birthday prompt: phones a bottom sheet, web a 441 card.
 * Text on the system (Airbnb-based) ramp: modal title 22/26, copy 14/20,
 * 24 padding, X top right. Bio field as on Edit Profile (100-word cap).
 * - "Save and join": inactive until something is written; saves the bio to
 *   the profile, joins, and posts the hello.
 * - "Skip for now": joins without a hello (they are asked again the next
 *   time they join a new event's chat).
 * - X / Escape: cancels the join.
 */
defineProps<{ open: boolean; busy?: boolean }>()
const emit = defineEmits<{ close: []; save: [bio: string]; skip: [] }>()
const bio = ref('')
const id = useId()
const words = computed(() => countWords(bio.value))
const ready = computed(() => words.value > 0)
function onInput(e: Event) {
  const el = e.target as HTMLTextAreaElement
  const capped = capWords(el.value)
  if (capped !== el.value) el.value = capped
  bio.value = el.value
}
function save() { if (ready.value) emit('save', bio.value) }
</script>

<template>
  <UiModal :open="open" :width="441" phone="sheet" card-class="profile-prompt-card" :dismissible="!busy" :labelledby="`${id}-t`" @close="emit('close')">
    <form class="profile-bio" novalidate @submit.prevent="save">
      <div class="profile-bio__top">
        <div class="profile-bio__head">
          <div class="profile-bio__text">
            <h2 :id="`${id}-t`" class="profile-bio__title text-modal-title">Introduce yourself</h2>
            <p :id="`${id}-c`" class="profile-bio__copy text-app-small-regular">You'll need a short bio so people in the chat can get to know you. We'll post it as your hello when you join.</p>
          </div>
          <button type="button" class="profile-close profile-bio__x" aria-label="Close" @click="emit('close')">
            <img src="/images/host/icon-close-16.svg" alt="" width="16" height="16" />
          </button>
        </div>
        <div class="profile-field">
          <label :for="`${id}-bio`" class="profile-visually-hidden">Bio</label>
          <div class="profile-bio__box">
            <textarea
              :id="`${id}-bio`"
              :value="bio"
              class="profile-input profile-bio__input"
              placeholder="e.g. I'm an actor, my hobbies are eating and cooking, I'm glad to meet y'all"
              :aria-describedby="`${id}-c ${id}-wc`"
              data-autofocus
              @input="onInput"
            />
            <span :id="`${id}-wc`" class="profile-bio__count text-app-small-regular">{{ words }}/{{ BIO_MAX_WORDS }} words</span>
          </div>
        </div>
      </div>
      <div class="profile-bio__actions">
        <UiButton
          type="submit"
          :class="['profile-bio__btn', { 'profile-inactive': !ready || busy }]"
          :color="ready ? 'primary' : 'secondary'"
          :aria-disabled="!ready || busy ? 'true' : undefined"
        >{{ busy ? 'Saving…' : 'Save and join' }}</UiButton>
        <UiButton class="profile-bio__btn" fill="ghost" color="secondary" :aria-disabled="busy ? 'true' : undefined" @click="!busy && emit('skip')">Skip for now</UiButton>
      </div>
    </form>
  </UiModal>
</template>

<style scoped>
.profile-bio { display: flex; flex-direction: column; gap: var(--spacing-2xl); }
.profile-bio__top { display: flex; flex-direction: column; gap: var(--spacing-lg); }
.profile-bio__head { position: relative; }
.profile-bio__text { display: flex; flex-direction: column; gap: var(--spacing-xxs); padding-right: var(--spacing-lg); }
.profile-bio__title { margin: 0; color: var(--color-text-checkout); }
.profile-bio__copy { margin: 0; color: var(--color-text-secondary); }
.profile-bio__x { position: absolute; top: 0; right: 0; }
.profile-bio__box { position: relative; }
.profile-bio__input { box-sizing: border-box; display: block; width: 100%; height: 120px; padding: var(--spacing-md) var(--spacing-md) 36px; resize: none; }
.profile-bio__count { position: absolute; right: var(--spacing-md); bottom: 12px; color: var(--color-text-muted); pointer-events: none; }
.profile-bio__actions { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.profile-bio__btn.ui-button { width: 100%; }
</style>
