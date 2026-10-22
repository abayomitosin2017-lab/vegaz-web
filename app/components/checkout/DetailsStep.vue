<script setup lang="ts">
/**
 * Step 2, only when the email has no Vegaz account: "Give us more details"
 * (Figma Desktop 59 / iPhone 23). First name, last name (Figma labels it
 * "First Name" twice; fixed by decision 22 Oct), phone (filled from step 1),
 * gender radios (24px, 8px to the label, 16px apart). Back / Continue.
 * Continue is active once every field is filled (proposed; no errors designed).
 */
import type { BuyerDetails } from '~/types/checkout'
import type { Gender } from '~/types/auth'

const props = defineProps<{ titleId: string; initial: Partial<BuyerDetails> }>()
const emit = defineEmits<{ close: []; back: []; submit: [value: BuyerDetails] }>()

const form = reactive({
  firstName: props.initial.firstName ?? '',
  lastName: props.initial.lastName ?? '',
  phone: props.initial.phone ?? '',
  gender: (props.initial.gender ?? null) as Gender | null,
})
const name = useId()
const ready = computed(() => !!form.firstName.trim() && !!form.lastName.trim() && form.phone.trim().length >= 7 && !!form.gender)
function submit() {
  if (ready.value) emit('submit', { firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone.trim(), gender: form.gender! })
}
const options: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]
</script>

<template>
  <form class="checkout-step" novalidate @submit.prevent="submit">
    <CheckoutHeader :title-id="titleId" title="Give us more details" subtitle="You do not have an existing vegaz account, please provide your details" @close="emit('close')" />
    <div class="checkout-fields">
      <UiTextField v-model="form.firstName" fixed label="First Name" placeholder="Enter first name" autocomplete="given-name" data-autofocus />
      <UiTextField v-model="form.lastName" fixed label="Last Name" placeholder="Enter last name" autocomplete="family-name" />
      <UiTextField v-model="form.phone" fixed type="tel" label="Phone Number" placeholder="Enter phone number" autocomplete="tel" />
      <fieldset class="checkout-gender">
        <legend class="checkout-gender__legend text-app-small-semibold">Gender</legend>
        <div class="checkout-gender__options">
          <label v-for="o in options" :key="o.value" class="checkout-gender__option">
            <input v-model="form.gender" class="checkout-gender__input" type="radio" :name="name" :value="o.value" />
            <img :src="form.gender === o.value ? '/images/auth/radio-on.svg' : '/images/auth/radio-off.svg'" alt="" width="24" height="24" />
            <span class="text-app-small-semibold">{{ o.label }}</span>
          </label>
        </div>
      </fieldset>
    </div>
    <div class="checkout-actions">
      <UiButton color="secondary" @click="emit('back')">Back</UiButton>
      <UiButton type="submit" :color="ready ? 'primary' : 'secondary'" :aria-disabled="!ready ? 'true' : undefined">Continue</UiButton>
    </div>
  </form>
</template>

<style scoped>
.checkout-gender { display: flex; flex-direction: column; gap: var(--spacing-xs); margin: 0; padding: 0; border: 0; }
.checkout-gender__legend { margin-bottom: var(--spacing-xs); padding: 0; color: var(--color-text-checkout); }
.checkout-gender__options { display: flex; gap: var(--spacing-md); }
.checkout-gender__option { position: relative; display: inline-flex; align-items: center; gap: var(--spacing-xs); color: var(--color-text-checkout); cursor: pointer; }
.checkout-gender__input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.checkout-gender__option:has(.checkout-gender__input:focus-visible) { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); border-radius: var(--radius-sm); }
</style>
