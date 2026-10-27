<script setup lang="ts">
/**
 * Step 4 (signup only): "Wassap {first name}" gender choice (Figma 9870:62696).
 * Continue becomes active once an option is chosen (Figma shows it grey with
 * Female selected; treated as not updated).
 */
import './styles.css'
import type { Gender } from '~/types/auth'

const props = defineProps<{ titleId: string; firstName: string; initial?: Gender; busy?: boolean }>()
const emit = defineEmits<{ close: []; back: []; change: [gender: Gender]; submit: [gender: Gender] }>()

const gender = ref<Gender | undefined>(props.initial)
watch(gender, (v) => { if (v) emit('change', v) })
const name = useId()
const options: { value: Gender; label: string; image: string }[] = [
  { value: 'female', label: 'Female', image: '/images/auth/memoji-female.svg' },
  { value: 'male', label: 'Male', image: '/images/auth/memoji-male.svg' },
]
function submit() {
  if (gender.value && !props.busy) emit('submit', gender.value)
}
</script>

<template>
  <form class="auth-gender auth-stack" novalidate @submit.prevent="submit">
    <div class="auth-gender__top auth-stack">
      <AuthStepHeader icon="/images/auth/icon-ai-magic.svg" @close="emit('close')" />
      <div class="auth-gender__content auth-stack">
        <div class="auth-gender__intro auth-stack">
          <h2 :id="titleId" class="auth-title">Wassap {{ firstName }} 👋</h2>
          <div class="auth-gender__copy text-body-regular">
            <p>Now that we know your names, Let’s create your profile.</p>
            <p aria-hidden="true">&#8203;</p>
            <p id="gender-question">But first, which of these are you most comfortable to identify as ?</p>
          </div>
        </div>

        <div class="auth-gender__options" role="radiogroup" aria-labelledby="gender-question">
          <template v-for="(opt, i) in options" :key="opt.value">
            <hr v-if="i > 0" class="auth-gender__divider" />
            <label :class="['auth-gender__option', `auth-gender__option--${opt.value}`]">
              <input v-model="gender" class="auth-gender__input" type="radio" :name="name" :value="opt.value" :data-autofocus="i === 0 ? '' : undefined" />
              <span class="auth-gender__who">
                <img class="auth-gender__memoji" :src="opt.image" alt="" width="48" height="48" />
                <span class="auth-gender__label text-body-semibold">{{ opt.label }}</span>
              </span>
              <img
                class="auth-gender__radio"
                :src="gender === opt.value ? '/images/auth/radio-on.svg' : '/images/auth/radio-off.svg'"
                alt=""
                width="24"
                height="24"
              />
            </label>
          </template>
        </div>
      </div>
    </div>

    <div class="auth-actions">
      <UiButton fill="ghost" color="secondary" text-style="web" @click="emit('back')">Back</UiButton>
      <UiButton
        type="submit"
        text-style="web"
        :color="gender ? 'primary' : 'secondary'"
        :aria-disabled="!gender || busy ? 'true' : undefined"
        :aria-busy="busy ? 'true' : undefined"
      >
        Continue
      </UiButton>
    </div>
  </form>
</template>

<style scoped>
.auth-gender { gap: var(--spacing-xl); align-items: center; }
.auth-gender__top { gap: var(--spacing-lg); }
.auth-gender__content { gap: var(--spacing-lg); }
.auth-gender__intro { gap: var(--spacing-xxs); }
.auth-gender__copy { color: var(--color-text-secondary); } /* body Grey_2 (decision 27 Oct) */
.auth-gender__copy p { margin: 0; }

.auth-gender__options { display: flex; flex-direction: column; gap: var(--spacing-md); width: 100%; }
.auth-gender__option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-radius: var(--radius-md);
}
.auth-gender__input { position: absolute; opacity: 0; width: 1px; height: 1px; margin: 0; pointer-events: none; }
.auth-gender__option:has(.auth-gender__input:focus-visible) {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--spacing-xxs);
}
.auth-gender__who { display: flex; align-items: center; }
/* Figma: Female row = 48px memoji, 33px gap, label. Male row = memoji and label
   spread across a 112px group. FLAG: so the two labels do not line up. */
.auth-gender__option--female .auth-gender__who { gap: 33px; }
.auth-gender__option--male .auth-gender__who { justify-content: space-between; width: 112px; }
.auth-gender__memoji { width: var(--sizing-control-standard); height: var(--sizing-control-standard); }
.auth-gender__label { color: var(--color-text-option); }
.auth-gender__radio { flex: none; width: var(--sizing-icon-standard); height: var(--sizing-icon-standard); }
/* FLAG: Figma draws this line as an image; drawn as a 1px Grey_5 rule here */
.auth-gender__divider {
  width: 100%;
  /* Figma line takes no layout space: pull the next row up by the line width */
  margin: 0 0 calc(-1 * var(--border-width-default));
  border: 0; border-top: var(--border-width-default) solid var(--color-border-default); }
</style>
