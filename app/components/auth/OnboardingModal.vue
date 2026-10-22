<script setup lang="ts">
/**
 * AuthOnboardingModal: the signup / login flow (Figma section "onboarding",
 * 10656:49108). Top row of frames = signup, bottom row = login.
 *
 *   signup: Email -> Enter Code -> Names -> Gender -> Account Setup Successful
 *   login:  Email -> Enter Code -> closes (signed in)
 *
 * Which flow runs is decided by the auth service after the email step
 * (mock: johnbade@gmail.com = existing account -> login; see mocks/auth.ts).
 * Back goes to the previous step; X or Escape closes and clears everything.
 * Signing in (decision 21 Oct): login signs in when the code is verified and
 * the modal closes; signup signs in when the account is created, so the header
 * behind the success card already shows the user, and "Start exploring" or X
 * closes the modal.
 */
import type { AuthFlow, Gender } from '~/types/auth'
import type { NamesValue } from './NamesStep.vue'
import { appStoreLinks } from '~/config/footer'
import { createAccount, sendCode, signIn, startWithEmail } from '~/services/auth'

type Step = 'email' | 'code' | 'names' | 'gender' | 'success'

const { isOpen, close } = useAuthModal()
const { setUser } = useSession()

const step = ref<Step>('email')
const flow = ref<AuthFlow>('signup')
const busy = ref(false)
const email = ref('')
const names = ref<NamesValue | undefined>()
const gender = ref<Gender | undefined>()
const titleId = useId()

/** Card widths from the Figma desktop frames (px); phones use the screen width minus 40 */
const widths: Record<Step, number> = { email: 376, code: 375, names: 435, gender: 375, success: 441 }

function reset() {
  step.value = 'email'
  flow.value = 'signup'
  busy.value = false
  email.value = ''
  names.value = undefined
  gender.value = undefined
}
function closeModal() {
  close()
  reset()
}

const modal = ref<{ focusFirst: () => void } | null>(null)
watch(step, async () => {
  await nextTick()
  modal.value?.focusFirst()
})

async function onEmail(value: string) {
  busy.value = true
  const res = await startWithEmail(value)
  await sendCode(value)
  busy.value = false
  email.value = value
  flow.value = res.flow
  step.value = 'code'
}

async function onVerified() {
  if (flow.value === 'login') {
    setUser(await signIn(email.value))
    closeModal()
  } else step.value = 'names'
}

function onNames(value: NamesValue) {
  names.value = value
  step.value = 'gender'
}

async function onGender(value: Gender) {
  if (!names.value) return
  gender.value = value
  busy.value = true
  setUser(await createAccount({ email: email.value, ...names.value, phone: names.value.phone || undefined, gender: value }))
  busy.value = false
  step.value = 'success'
}

function onDownload() {
  // OPEN ITEM: real store link (or a device-aware link). Placeholder for now.
  const href = appStoreLinks[0]?.href ?? '#'
  if (href !== '#') window.open(href, '_blank', 'noopener')
}

function back() {
  if (step.value === 'code') step.value = 'email'
  else if (step.value === 'names') step.value = 'code'
  else if (step.value === 'gender') step.value = 'names'
}
</script>

<template>
  <UiModal ref="modal" :open="isOpen" :width="widths[step]" :labelledby="titleId" fallback-focus="[data-account-trigger]" @close="closeModal">
    <AuthEmailStep v-if="step === 'email'" :title-id="titleId" :busy="busy" :initial-email="email" @close="closeModal" @submit="onEmail" />
    <AuthCodeStep v-else-if="step === 'code'" :title-id="titleId" :email="email" @close="closeModal" @back="back" @verified="onVerified" />
    <AuthNamesStep v-else-if="step === 'names'" :title-id="titleId" :initial="names" @close="closeModal" @back="back" @submit="onNames" />
    <AuthGenderStep
      v-else-if="step === 'gender'"
      :title-id="titleId"
      :first-name="names?.firstName ?? ''"
      :initial="gender"
      :busy="busy"
      @close="closeModal"
      @back="back"
      @change="gender = $event"
      @submit="onGender"
    />
    <AuthSuccessStep v-else :title-id="titleId" @explore="closeModal" @download="onDownload" />
  </UiModal>
</template>
