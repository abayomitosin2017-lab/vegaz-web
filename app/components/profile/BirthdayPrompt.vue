<script setup lang="ts">
import './styles.css'
/**
 * "When should we celebrate you?" (Figma mobile sheet 10834:28391; web
 * modal, web section 10838:19056).
 * Phones: bottom sheet, radius 24 top, padding 24. Web: 441px card, radius
 * 24, same content. 80px tilted cake picture, 24 below it the title
 * (Headline 1 bold 32/40 -1, #141316) and, 4 below, the copy (Small regular
 * Grey_2); 16px X top right. 24 below: the birthday field. 40 below: full-
 * width "Set Birthday" (Primary once a date is picked).
 */
defineProps<{ open: boolean; busy?: boolean }>()
const emit = defineEmits<{ close: []; save: [birthday: string] }>()
const birthday = ref<string | undefined>()
const id = useId()
function save() { if (birthday.value) emit('save', birthday.value) }
</script>

<template>
  <UiModal :open="open" :width="441" phone="sheet" card-class="profile-prompt-card" :labelledby="`${id}-t`" @close="emit('close')">
    <form class="profile-prompt profile-prompt--bday" novalidate @submit.prevent="save">
      <div class="profile-prompt__top">
        <div class="profile-prompt__head">
          <span class="profile-prompt__cake" aria-hidden="true"><img src="/images/profile/birthday-cake-80.png" alt="" width="128" height="129" /></span>
          <div class="profile-prompt__text">
            <h2 :id="`${id}-t`" class="profile-prompt__title text-app-h1-bold">When should we celebrate you?</h2>
            <p :id="`${id}-c`" class="profile-prompt__copy text-app-small-regular">We would love for you to share your birthday with us! Let us know when it is so we can help plan a fabulous hangout</p>
          </div>
          <button type="button" class="profile-close profile-prompt__x" aria-label="Close" @click="emit('close')">
            <img src="/images/host/icon-close-16.svg" alt="" width="16" height="16" />
          </button>
        </div>
        <ProfileBirthdayField :id="`${id}-d`" v-model="birthday" label="Your birthday" />
      </div>
      <UiButton
        type="submit"
        :class="['profile-prompt__btn', { 'profile-inactive': !birthday || busy }]"
        :color="birthday ? 'primary' : 'secondary'"
        :aria-disabled="!birthday || busy ? 'true' : undefined"
        data-autofocus
      >{{ busy ? 'Saving…' : 'Set Birthday' }}</UiButton>
    </form>
  </UiModal>
</template>

<style scoped>
.profile-prompt { display: flex; flex-direction: column; gap: var(--spacing-2xl); }
.profile-prompt__top { display: flex; flex-direction: column; gap: var(--spacing-lg); }
.profile-prompt__head { position: relative; display: flex; flex-direction: column; gap: var(--spacing-lg); }
.profile-prompt__cake { position: relative; display: block; width: 80px; height: 80px; }
/* the exported picture includes its tilt, white border and shadow, which reach past the 80px box */
.profile-prompt__cake img { position: absolute; left: -24px; top: -17.7px; width: 127.5px; height: 129.2px; max-width: none; }
.profile-prompt__text { display: flex; flex-direction: column; gap: var(--spacing-xxs); padding-right: var(--spacing-lg); }
.profile-prompt__title { margin: 0; color: var(--color-text-checkout); }
.profile-prompt__copy { margin: 0; color: var(--color-text-secondary); }
.profile-prompt__x { position: absolute; top: 0; right: 0; }
.profile-prompt__btn.ui-button { width: 100%; }
</style>

<style>
/* Both prompts: 24 padding all round; radius 24 (web), 24 top only (phone sheet) */
.ui-modal .ui-modal__card.profile-prompt-card.profile-prompt-card { padding: var(--spacing-lg); }
@media (max-width: 767px) {
  .ui-modal .ui-modal__card.profile-prompt-card.profile-prompt-card { padding: var(--spacing-lg) var(--spacing-lg) calc(var(--spacing-lg) + env(safe-area-inset-bottom, 0px)); }
}
</style>
