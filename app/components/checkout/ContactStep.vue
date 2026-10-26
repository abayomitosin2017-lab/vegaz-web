<script setup lang="ts">
/**
 * Step 1, signed-out buyers only: "Buy Ticket — Provide your contact
 * information" (Figma Desktop 58 / iPhone 20). Signed-in buyers skip it
 * (decision 22 Oct).
 * Email and phone, then a full-width Proceed (40px below the fields; Figma
 * 32 + the sheet padding). Proceed is active once the email looks valid and a
 * phone number is typed (not in Figma: no error states designed; proposed).
 */
import type { CheckoutContact } from '~/types/checkout'

const props = defineProps<{ titleId: string; initial: CheckoutContact; busy?: boolean; free?: boolean }>()
const emit = defineEmits<{ close: []; submit: [value: CheckoutContact] }>()

const form = reactive({ ...props.initial })
const ready = computed(() => /^\S+@\S+\.\S+$/.test(form.email.trim()) && form.phone.trim().length >= 7)
function submit() {
  if (ready.value && !props.busy) emit('submit', { email: form.email.trim(), phone: form.phone.trim() })
}
</script>

<template>
  <form class="checkout-step" novalidate @submit.prevent="submit">
    <CheckoutHeader :title-id="titleId" :title="free ? 'RSVP' : 'Buy Ticket'" subtitle="Provide your contact information" @close="emit('close')" />
    <div class="checkout-fields">
      <UiTextField v-model="form.email" fixed type="email" label="Email Address" placeholder="Enter email address" autocomplete="email" data-autofocus />
      <UiTextField v-model="form.phone" fixed type="tel" label="Phone Number" placeholder="Enter phone number" autocomplete="tel" />
    </div>
    <UiButton
      type="submit"
      class="checkout-step__wide checkout-step__gap-32"
      :color="ready ? 'primary' : 'secondary'"
      :aria-disabled="!ready || busy ? 'true' : undefined"
      :aria-busy="busy ? 'true' : undefined"
    >
      Proceed
    </UiButton>
  </form>
</template>
