<script setup lang="ts">
import './styles.css'
import type { Gender } from '~/types/auth'
/**
 * "What do you identify as?" (Figma mobile sheet 10834:28462; web modal,
 * web section 10838:19056).
 * Title Headline 2 bold #141316 with a 16px X (8 from the top); 40 below,
 * two rows 16 apart with a line between: 48px memoji + label (Body
 * semibold, black), radio on the right (Primary when chosen, Grey_4 ring
 * otherwise). 40 below: full-width "Done" (Primary once one is chosen).
 */
const props = defineProps<{ open: boolean; busy?: boolean; initial?: Gender }>()
const emit = defineEmits<{ close: []; save: [gender: Gender] }>()
const gender = ref<Gender | undefined>(props.initial)
watch(() => props.open, o => { if (o) gender.value = props.initial })
const id = useId()
const options: { value: Gender; label: string; image: string }[] = [
  { value: 'female', label: 'Female', image: '/images/auth/memoji-female.svg' },
  { value: 'male', label: 'Male', image: '/images/auth/memoji-male.svg' },
]
function save() { if (gender.value) emit('save', gender.value) }
</script>

<template>
  <UiModal :open="open" :width="441" phone="sheet" card-class="profile-prompt-card" :labelledby="`${id}-t`" @close="emit('close')">
    <form class="profile-gp" novalidate @submit.prevent="save">
      <div class="profile-gp__top">
        <div class="profile-gp__head">
          <h2 :id="`${id}-t`" class="profile-gp__title text-app-h2-bold">What do you identify as?</h2>
          <button type="button" class="profile-close" aria-label="Close" @click="emit('close')">
            <img src="/images/host/icon-close-16.svg" alt="" width="16" height="16" />
          </button>
        </div>
        <div class="profile-gp__list" role="radiogroup" :aria-labelledby="`${id}-t`">
          <template v-for="(opt, i) in options" :key="opt.value">
            <hr v-if="i > 0" class="profile-rule profile-gp__line" />
            <label class="profile-gp__row">
              <span :class="['profile-gp__who', `profile-gp__who--${opt.value}`]">
                <img :src="opt.image" alt="" width="48" height="48" />
                <span class="profile-gp__label text-app-body-semibold">{{ opt.label }}</span>
              </span>
              <input v-model="gender" class="profile-visually-hidden" type="radio" :name="`${id}-g`" :value="opt.value" />
              <img class="profile-gp__radio" :src="gender === opt.value ? '/images/auth/radio-on.svg' : '/images/auth/radio-off.svg'" alt="" width="24" height="24" />
            </label>
          </template>
        </div>
      </div>
      <UiButton
        type="submit"
        :class="['profile-gp__btn', { 'profile-inactive': !gender || busy }]"
        :color="gender ? 'primary' : 'secondary'"
        :aria-disabled="!gender || busy ? 'true' : undefined"
      >{{ busy ? 'Saving…' : 'Done' }}</UiButton>
    </form>
  </UiModal>
</template>

<style scoped>
.profile-gp { display: flex; flex-direction: column; gap: var(--spacing-2xl); }
.profile-gp__top { display: flex; flex-direction: column; gap: var(--spacing-2xl); }
.profile-gp__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--spacing-md); }
.profile-gp__head .profile-close { margin-top: var(--spacing-xs); }
.profile-gp__title { margin: 0; color: var(--color-text-checkout); }
.profile-gp__list { display: flex; flex-direction: column; gap: var(--spacing-md); }
.profile-gp__row { position: relative; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border-radius: var(--radius-md); }
.profile-gp__row:has(input:focus-visible) { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 4px; }
.profile-gp__who { display: flex; align-items: center; gap: 33px; }
.profile-gp__who--male { width: 112px; justify-content: space-between; gap: 0; } /* as drawn: male row 112 wide */
.profile-gp__who img { width: 48px; height: 48px; }
.profile-gp__label { color: var(--color-text-option); }
.profile-gp__radio { width: 24px; height: 24px; }
.profile-gp__btn.ui-button { width: 100%; }
</style>
