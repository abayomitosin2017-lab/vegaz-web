<script setup lang="ts">
/** Step 1 (signup and login): "What's your Email Address" (Figma 9870:58477 / 60915). */
import './styles.css'

const props = defineProps<{ titleId: string; busy?: boolean; initialEmail?: string }>()
const emit = defineEmits<{ close: []; submit: [email: string] }>()

const email = ref(props.initialEmail ?? '')
// Simple shape check only; the real validation rules belong to the API.
const isValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()))
function submit() {
  if (isValid.value && !props.busy) emit('submit', email.value.trim())
}
</script>

<template>
  <form class="auth-email auth-stack" novalidate @submit.prevent="submit">
    <div class="auth-email__top auth-stack">
      <AuthStepHeader icon="/images/auth/icon-mail.svg" @close="emit('close')" />
      <div class="auth-email__intro auth-stack">
        <h2 :id="titleId" class="auth-title">What’s your Email Address</h2>
        <p class="auth-copy text-small-regular">Please enter your email address</p>
      </div>
      <UiTextField
        v-model="email"
        type="email"
        placeholder="E.g lagbaja@gmail.com"
        aria-label="Email address"
        autocomplete="email"
        data-autofocus
      />
    </div>

    <!-- Built exactly as Figma, which mixes two sizes in this sentence: most of it is
         x-Small (14/18 desktop, 12/18 mobile) but the spaces, "and" and the "o" of "our"
         are Small (16/24 desktop, 14/20 mobile), which makes some lines taller.
         FLAG for design: probably unintended. -->
    <p class="auth-email__terms"><span class="t-x">By continuing you agree to our</span><span class="t-s">{{ ' ' }}</span><a
      href="#" class="t-x t-strong auth-email__link">Terms of Service</a><span class="t-s t-semi">{{ ' ' }}</span><span
      class="t-s">and</span><span class="t-s t-semi">{{ ' o' }}</span><span class="t-x t-semi">{{ 'ur ' }}</span><a
      href="#" class="t-x t-strong auth-email__link">Privacy Policy</a><span class="t-s t-dark">{{ ' ' }}</span><span
      class="t-x">and that you’re 18 years old</span></p>

    <UiButton
      type="submit"
      text-style="web"
      :color="isValid ? 'primary' : 'secondary'"
      :aria-disabled="!isValid || busy ? 'true' : undefined"
      :aria-busy="busy ? 'true' : undefined"
      class="auth-email__continue"
    >
      Continue
    </UiButton>
  </form>
</template>

<style scoped>
.auth-email { gap: var(--spacing-2xl); }
.auth-email__top { gap: var(--spacing-lg); }
.auth-email__intro { gap: var(--spacing-xxs); }
.auth-email__terms {
  width: 310px;
  max-width: 100%;
  margin: 0 auto;
  color: var(--color-text-note);
  font-family: var(--font-family-base);
  font-weight: var(--text-xsmall-regular-weight);
  /* Base size = x-Small so the paragraph's own line box does not add height */
  font-size: var(--text-xsmall-regular-size);
  line-height: var(--text-xsmall-regular-line);
  text-align: center;
}
/* x-Small and Small text sizes as used inside the Figma sentence */
.t-x { font-size: var(--text-xsmall-regular-size); line-height: var(--text-xsmall-regular-line); }
.t-s { font-size: var(--text-small-regular-size); line-height: var(--text-small-regular-line); }
.t-semi { font-weight: var(--font-weight-semibold); }
.t-strong { font-weight: var(--font-weight-semibold); color: var(--color-text-heading-strong); }
.t-dark { color: var(--color-text-heading-strong); }
.auth-email__link { text-decoration: none; border-radius: var(--radius-xs); }
.auth-email__link:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }
.auth-email__continue { width: 100%; }
</style>
