<script setup lang="ts">
import './styles.css'
import type { DraftTicket, TicketKindOption } from '~/types/hosting'
/**
 * Phone "Create Ticket" screen (Figma mobile frames 10754:71114-71724):
 * full screen over Ticket Details. Header: "Create Ticket" (Headline 2
 * semibold 24/32 #0E0F11) and a 24px close X, 26px from the sides; the
 * form 24px from the sides, fields 17 apart; "Add Ticket" fixed 40px above
 * the bottom (secondary until the ticket is complete).
 * Editing (not drawn on phones, PROPOSED): "Edit Ticket" / "Save Changes".
 * Adding or saving closes the screen and the card shows in the list.
 */
defineProps<{ open: boolean; kinds: TicketKindOption[]; editing: DraftTicket | null }>()
const emit = defineEmits<{ close: []; add: [ticket: DraftTicket]; save: [ticket: DraftTicket] }>()
const id = useId()
const root = ref<HTMLElement | null>(null)
let returnTo: HTMLElement | null = null

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && !(e.target as HTMLElement).closest('[role=listbox], .host-pop')) emit('close')
}
watch(() => root.value, el => {
  if (el) { returnTo = document.activeElement as HTMLElement | null; nextTick(() => el.querySelector<HTMLElement>('.checkout-select__field')?.focus()) }
  else nextTick(() => returnTo?.isConnected && returnTo.focus())
})
</script>

<template>
  <Teleport to="body">
    <Transition name="host-mscreen">
      <div v-if="open" ref="root" class="host-mscreen" role="dialog" aria-modal="true" :aria-labelledby="`${id}-t`" @keydown="onKey">
        <div class="host-mscreen__head">
          <h2 :id="`${id}-t`" class="host-mscreen__title">{{ editing ? 'Edit Ticket' : 'Create Ticket' }}</h2>
          <button type="button" class="host-mscreen__close" aria-label="Close" @click="emit('close')">
            <img src="/images/host/m-cancel-24.svg" alt="" width="24" height="24" />
          </button>
        </div>
        <HostTicketForm phone :kinds="kinds" :editing="editing" @add="t => emit('add', t)" @save="t => emit('save', t)" @cancel="emit('close')" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.host-mscreen {
  position: fixed;
  inset: 0;
  z-index: 900;
  overflow-y: auto;
  padding: calc(21px + env(safe-area-inset-top, 0px)) var(--container-inset-mobile) 0;
  background: var(--color-background-primary);
}
.host-mscreen__head { display: flex; align-items: center; justify-content: space-between; margin: 0 2px 38px; }
.host-mscreen__title { margin: 0; color: var(--color-host-row-label); font-family: var(--font-family-base); font-weight: var(--text-modal-title-weight); font-size: var(--text-modal-title-size); line-height: var(--text-modal-title-line); letter-spacing: var(--text-modal-title-tracking); }
.host-mscreen__close { display: inline-flex; padding: 0; border: 0; background: none; cursor: pointer; border-radius: var(--radius-pill); }
.host-mscreen__close:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
/* No open / close animation (decision 26 Oct) */
</style>
