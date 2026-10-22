<script setup lang="ts">
/**
 * "Assign tickets — <event name>" (Figma Desktop 67 / 69, iPhone 27 / 29).
 *
 * Progress: "N of M assigned" (Small semibold) and "N remaining" (x-Small
 * regular Grey_2); 4px Grey_5 track with a Primary fill, radius 4.
 * People: Grey_6 rows, radius 8, 10 / 16 padding, 8px apart: name (Small
 * semibold Primary), email (x-Small semibold), "<type> · You · Ticket buyer"
 * (x-Small regular Grey_2), "Edit" on the right (44px tap area). More than
 * three rows: the list scrolls (250px tall, thin scrollbar as in Figma) with
 * "Scroll to see all N assignees" under it.
 * "+ Assign Ticket" while tickets are left; it opens Add user.
 * Back / Proceed. Decision 22 Oct: every ticket must have a person, so
 * Proceed stays grey and inactive until 0 remaining (Figma: grey at 1 of 8,
 * purple at 8 of 8).
 */
import type { TicketAssignee } from '~/types/checkout'
import type { TicketType } from '~/types/ticket'

const props = defineProps<{ titleId: string; eventTitle: string; tickets: TicketType[]; assignees: TicketAssignee[]; count: number }>()
const emit = defineEmits<{ close: []; back: []; add: []; edit: [id: string]; proceed: [] }>()

const assigned = computed(() => props.assignees.length)
const remaining = computed(() => Math.max(0, props.count - assigned.value))
const done = computed(() => remaining.value === 0)
const scrolls = computed(() => props.assignees.length > 3)
const tierName = (id: string) => props.tickets.find(t => t.id === id)?.name ?? ''
const meta = (a: TicketAssignee) => [tierName(a.ticketId), ...(a.isBuyer ? ['You', 'Ticket buyer'] : [])].join(' · ')
</script>

<template>
  <div class="checkout-step checkout-step--32">
    <CheckoutHeader :title-id="titleId" title="Assign tickets" :subtitle="eventTitle" close="sheet" @close="emit('close')" />

    <div class="checkout-assign">
      <div class="checkout-assign__progress">
        <div class="checkout-assign__labels">
          <span class="text-app-small-semibold">{{ assigned }} of {{ count }} assigned</span>
          <span class="checkout-assign__left text-app-xsmall-regular">{{ remaining }} remaining</span>
        </div>
        <div class="checkout-assign__track" role="progressbar" :aria-valuenow="assigned" aria-valuemin="0" :aria-valuemax="count" :aria-label="`${assigned} of ${count} tickets assigned`">
          <span class="checkout-assign__fill" :style="{ width: `${count ? (assigned / count) * 100 : 0}%` }" />
        </div>
      </div>

      <ul :class="['checkout-assign__list', { 'checkout-assign__list--scroll': scrolls }]" :tabindex="scrolls ? 0 : undefined" aria-label="Ticket holders">
        <li v-for="a in assignees" :key="a.id" class="checkout-assign__row">
          <span class="checkout-assign__who">
            <span class="checkout-assign__name text-app-small-semibold">{{ a.fullName }}</span>
            <span class="checkout-assign__email text-app-xsmall-semibold">{{ a.email }}</span>
            <span class="checkout-assign__meta text-app-xsmall-regular">{{ meta(a) }}</span>
          </span>
          <button type="button" class="checkout-assign__edit text-app-small-semibold" :aria-label="`Edit ${a.fullName}`" @click="emit('edit', a.id)">Edit</button>
        </li>
      </ul>
      <p v-if="scrolls" class="checkout-assign__hint text-app-xsmall-regular">Scroll to see all {{ assignees.length }} assignees</p>

      <button v-if="!done" type="button" class="checkout-link text-app-xsmall-semibold" @click="emit('add')">
        <img src="/images/checkout/icon-add-16.svg" alt="" width="16" height="16" />
        Assign Ticket
      </button>
    </div>

    <div class="checkout-actions">
      <UiButton color="secondary" @click="emit('back')">Back</UiButton>
      <UiButton :color="done ? 'primary' : 'secondary'" :aria-disabled="!done ? 'true' : undefined" @click="done && emit('proceed')">Proceed</UiButton>
    </div>
  </div>
</template>

<style scoped>
.checkout-assign { display: flex; flex-direction: column; gap: var(--spacing-lg); }
.checkout-assign__progress { display: flex; flex-direction: column; gap: var(--spacing-xs); color: var(--color-text-checkout); }
.checkout-assign__labels { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-xs); }
.checkout-assign__left { color: var(--color-text-secondary); }
.checkout-assign__track { position: relative; height: 4px; overflow: hidden; border-radius: var(--radius-xs); background: var(--color-border-default); }
.checkout-assign__fill { position: absolute; inset: 0 auto 0 0; border-radius: var(--radius-xs); background: var(--color-action-primary); transition: width 200ms ease; }

.checkout-assign__list { display: flex; flex-direction: column; gap: var(--spacing-xs); margin: 0; padding: 0; list-style: none; }
.checkout-assign__list--scroll {
  max-height: 250px;
  padding-right: var(--spacing-xxs);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-text-disabled) var(--color-background-secondary);
}
.checkout-assign__list--scroll:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }
.checkout-assign__row {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 10px var(--spacing-md); /* Figma 10 / 16 */
  border-radius: var(--radius-sm);
  background: var(--color-background-secondary);
}
.checkout-assign__who { display: flex; flex: 1 1 auto; flex-direction: column; gap: 2px; min-width: 0; }
.checkout-assign__who > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.checkout-assign__name { color: var(--color-action-primary); }
.checkout-assign__email { color: var(--color-text-checkout); }
.checkout-assign__meta { color: var(--color-text-secondary); }
.checkout-assign__edit {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: flex-end;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-action-primary);
  cursor: pointer;
}
.checkout-assign__edit:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
.checkout-assign__hint { margin: 0; color: var(--color-text-secondary); text-align: center; }
@media (prefers-reduced-motion: reduce) { .checkout-assign__fill { transition: none; } }
</style>
