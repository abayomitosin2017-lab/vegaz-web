<script setup lang="ts">
/**
 * Step 3 (signup only): "What are your names" (Figma 9870:61964 / 62334).
 * Continue is active when first name, last name and an available username
 * are filled; phone number is optional (Figma shows Continue active with it
 * empty). Username availability is checked as you type (mock service).
 * No "username taken" state is designed yet: a taken name just keeps
 * Continue inactive. OPEN ITEM for design.
 */
import './styles.css'
import { checkUsername } from '~/services/auth'

export interface NamesValue { firstName: string; lastName: string; username: string; phone: string }

const props = defineProps<{ titleId: string; initial?: Partial<NamesValue> }>()
const emit = defineEmits<{ close: []; back: []; submit: [value: NamesValue] }>()

const form = reactive<NamesValue>({
  firstName: props.initial?.firstName ?? '',
  lastName: props.initial?.lastName ?? '',
  username: props.initial?.username ?? '',
  phone: props.initial?.phone ?? '',
})
const available = ref(false)
let checkId = 0
let debounce: ReturnType<typeof setTimeout> | undefined

watch(
  () => form.username,
  (name) => {
    available.value = false
    clearTimeout(debounce)
    const value = name.trim()
    if (!value) return
    const id = ++checkId
    debounce = setTimeout(async () => {
      const res = await checkUsername(value)
      if (id === checkId) available.value = res.available
    }, 400)
  },
  { immediate: true },
)
onBeforeUnmount(() => clearTimeout(debounce))

const ready = computed(() => !!form.firstName.trim() && !!form.lastName.trim() && !!form.username.trim() && available.value)
function submit() {
  if (ready.value) emit('submit', { ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), username: form.username.trim() })
}
</script>

<template>
  <form class="auth-names auth-stack" novalidate @submit.prevent="submit">
    <div class="auth-names__top auth-stack">
      <AuthStepHeader icon="/images/auth/icon-user.svg" @close="emit('close')" />
      <!-- Figma stacks the intro and the fields in one cell, fields 100px from the top -->
      <div class="auth-names__stack">
        <div class="auth-names__intro auth-stack">
          <h2 :id="titleId" class="auth-title">What are your names</h2>
          <p class="auth-copy text-small-regular">Input your name and choose a unique username that matches your rizz 😉</p>
        </div>
        <div class="auth-names__fields auth-stack">
          <div class="auth-names__row">
            <UiTextField v-model="form.firstName" label="First Name" placeholder="Enter first name" autocomplete="given-name" data-autofocus />
            <UiTextField v-model="form.lastName" label="Last Name" placeholder="Enter last name" autocomplete="family-name" />
          </div>
          <UiTextField
            v-model="form.username"
            label="Username"
            placeholder="E.g Johntheeventhost"
            autocomplete="username"
            :success="available"
            success-label="Username available"
          />
          <UiTextField v-model="form.phone" type="tel" label="Phone Number" placeholder="Enter Phone Number" autocomplete="tel" />
        </div>
      </div>
    </div>

    <div class="auth-actions">
      <UiButton fill="ghost" color="secondary" text-style="web" @click="emit('back')">Back</UiButton>
      <UiButton type="submit" text-style="web" :color="ready ? 'primary' : 'secondary'" :aria-disabled="!ready ? 'true' : undefined">
        Continue
      </UiButton>
    </div>
  </form>
</template>

<style scoped>
.auth-names { gap: var(--spacing-xl); align-items: center; }
.auth-names__top { gap: var(--spacing-lg); }
.auth-names__stack { display: grid; grid-template-columns: minmax(0, 1fr); width: 100%; }
.auth-names__stack > * { grid-area: 1 / 1; }
.auth-names__intro { gap: var(--spacing-xxs); }
.auth-names__fields { gap: var(--spacing-xs); margin-top: 100px; }
.auth-names__row { display: flex; gap: var(--spacing-xs); width: 100%; }
.auth-names__row > * { flex: 1 0 0; min-width: 0; }
</style>
