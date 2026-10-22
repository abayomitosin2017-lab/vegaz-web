<script setup lang="ts">
/**
 * "Add user — <event name>" (Figma Desktop 68 / iPhone 28): Full Name, Email
 * Address, Phone Number, "Assign to tier" select. Back / Proceed.
 * Proceed is active once name, a valid email and a tier are set (phone is
 * optional; not stated in Figma, proposed). Figma shows Proceed grey here.
 * Editing someone reuses this form titled "Edit user" (proposed; Figma has
 * no edit frame). The tier list only offers types that still have
 * unassigned tickets (plus the person's current type when editing).
 */
import type { TicketAssignee } from '~/types/checkout'
import type { SelectOption } from './Select.vue'

const props = defineProps<{ titleId: string; eventTitle: string; options: SelectOption[]; initial?: TicketAssignee }>()
const emit = defineEmits<{ close: []; back: []; submit: [value: Omit<TicketAssignee, 'id' | 'isBuyer'>] }>()

const form = reactive({
  fullName: props.initial?.fullName ?? '',
  email: props.initial?.email ?? '',
  phone: props.initial?.phone ?? '',
  ticketId: (props.initial?.ticketId ?? (props.options.filter(o => !o.disabled).length === 1 ? props.options.find(o => !o.disabled)!.id : null)) as string | null,
})
const ready = computed(() => !!form.fullName.trim() && /^\S+@\S+\.\S+$/.test(form.email.trim()) && !!form.ticketId)
function submit() {
  if (ready.value) emit('submit', { fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() || undefined, ticketId: form.ticketId! })
}
</script>

<template>
  <form class="checkout-step checkout-step--32" novalidate @submit.prevent="submit">
    <CheckoutHeader :title-id="titleId" :title="initial ? 'Edit user' : 'Add user'" :subtitle="eventTitle" close="sheet" @close="emit('close')" />
    <div class="checkout-fields">
      <UiTextField v-model="form.fullName" fixed label="Full Name" placeholder="Enter full name" autocomplete="off" data-autofocus />
      <UiTextField v-model="form.email" fixed type="email" label="Email Address" placeholder="Enter email address" autocomplete="off" />
      <UiTextField v-model="form.phone" fixed type="tel" label="Phone Number" placeholder="Enter phone number" autocomplete="off" />
      <CheckoutSelect v-model="form.ticketId" :options="options" label="Assign to tier" placeholder="Select Tier" />
    </div>
    <div class="checkout-actions">
      <UiButton color="secondary" @click="emit('back')">Back</UiButton>
      <UiButton type="submit" :color="ready ? 'primary' : 'secondary'" :aria-disabled="!ready ? 'true' : undefined">Proceed</UiButton>
    </div>
  </form>
</template>
