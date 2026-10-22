<script setup lang="ts">
/**
 * Step 2 (signup and login): "Enter Code" (Figma 9870:61236 / 61600 / 65271).
 * Resend line, as drawn in the three Figma states:
 *   counting down  -> "Resend code 14:15"
 *   code complete  -> "Resend Code" in Grey_3 (not needed)
 *   wrong code or countdown finished -> "Resend Code" in green, clickable
 */
import './styles.css'
import { mockResendSeconds } from '~/mocks/auth'
import { sendCode, verifyCode } from '~/services/auth'

const props = defineProps<{ titleId: string; email: string }>()
const emit = defineEmits<{ close: []; back: []; verified: [] }>()

const code = ref('')
const error = ref(false)
const busy = ref(false)
const secondsLeft = ref(mockResendSeconds)
const codeInput = ref<{ focus: () => void } | null>(null)
let timer: ReturnType<typeof setInterval> | undefined

function startCountdown() {
  clearInterval(timer)
  secondsLeft.value = mockResendSeconds
  timer = setInterval(() => {
    if (secondsLeft.value > 0) secondsLeft.value -= 1
    else clearInterval(timer)
  }, 1000)
}
onMounted(startCountdown)
onBeforeUnmount(() => clearInterval(timer))

const isComplete = computed(() => code.value.length === 6)
const countdown = computed(() => {
  const m = Math.floor(secondsLeft.value / 60)
  const s = secondsLeft.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})
const resendState = computed<'countdown' | 'idle' | 'active'>(() => {
  if (error.value || secondsLeft.value === 0) return 'active'
  if (isComplete.value) return 'idle'
  return 'countdown'
})

watch(code, () => { if (error.value) error.value = false })

async function resend() {
  await sendCode(props.email)
  code.value = ''
  error.value = false
  startCountdown()
  codeInput.value?.focus()
}

async function submit() {
  if (!isComplete.value || busy.value) return
  busy.value = true
  const { ok } = await verifyCode(props.email, code.value)
  busy.value = false
  if (ok) emit('verified')
  else error.value = true
}
</script>

<template>
  <form class="auth-code auth-stack" novalidate @submit.prevent="submit">
    <div class="auth-code__top auth-stack">
      <AuthStepHeader icon="/images/auth/icon-sms-code.svg" @close="emit('close')" />
      <div class="auth-code__intro auth-stack">
        <h2 :id="titleId" class="auth-title">Enter Code</h2>
        <p class="auth-copy text-small-regular">
          We’ve sent a verification code to your mail <span class="auth-strong">{{ email }}</span>
        </p>
      </div>
      <div class="auth-code__field auth-stack">
        <UiCodeInput ref="codeInput" v-model="code" :error="error" />
        <p v-if="error" class="auth-code__error text-xsmall-semibold" role="alert">The code you entered is incorrect</p>
      </div>
    </div>

    <p v-if="resendState === 'countdown'" class="auth-code__resend auth-code__resend--countdown text-small-regular" aria-live="off">
      Resend code <span class="auth-code__time">{{ countdown }}</span>
    </p>
    <p v-else-if="resendState === 'idle'" class="auth-code__resend auth-code__resend--idle text-small-semibold">Resend Code</p>
    <button v-else type="button" class="auth-code__resend auth-code__resend--active text-small-semibold" @click="resend">Resend Code</button>

    <div class="auth-actions">
      <UiButton fill="ghost" color="secondary" text-style="web" @click="emit('back')">Back</UiButton>
      <UiButton
        type="submit"
        text-style="web"
        :color="isComplete && !error ? 'primary' : 'secondary'"
        :aria-disabled="!isComplete || error || busy ? 'true' : undefined"
        :aria-busy="busy ? 'true' : undefined"
      >
        Continue
      </UiButton>
    </div>
  </form>
</template>

<style scoped>
.auth-code { gap: var(--spacing-2xl); align-items: center; }
.auth-code__top { gap: var(--spacing-lg); }
.auth-code__intro { gap: var(--spacing-xxs); }
.auth-code__field { gap: var(--spacing-xs); }
.auth-code__error { color: var(--color-status-error); }
.auth-code__resend {
  width: 310px;
  max-width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: center;
}
.auth-code__resend--countdown { color: var(--color-text-note); }
.auth-code__time { font-weight: var(--font-weight-semibold); }
.auth-code__resend--idle { color: var(--color-text-muted); }
.auth-code__resend--active { color: var(--color-status-success); cursor: pointer; border-radius: var(--radius-xs); }
.auth-code__resend--active:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }
</style>
