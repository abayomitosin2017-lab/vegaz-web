<script setup lang="ts">
import './styles.css'
import type { DraftTicket } from '~/types/hosting'
import { formatNaira, priceRange } from '~/utils/money'
/**
 * A created ticket in "Your tickets" (Figma frames 11-15b, redesigned 23 Oct).
 * White, 0.5px dashed Primary line, 0 4 16 shadow at 5%, radius 16, 16
 * padding. Left: chips (name in Primary on #F4F5F8, quantity with a person
 * icon), price H2 app bold 24/32 #141316, description x-Small regular
 * Grey_3. Right: edit (pen) and delete (red bin) 34px round buttons.
 * Being edited (15b): #ECEFFE fill and a 2px solid Primary line.
 * Shows the host's price (before the fee), as drawn.
 * Gender-based: since 26 Oct each gender is its own ticket ("FEMALE TICKET",
 * "MALE TICKET") with one chip and one price, like any other ticket.
 */
const props = defineProps<{ ticket: DraftTicket; editing?: boolean }>()
defineEmits<{ edit: []; delete: [] }>()

const qty = (q: number | null) => (q === null ? 'Unlimited' : String(q))
const chips = computed(() => props.ticket.kind === 'gender' && props.ticket.lines.length > 1
  ? props.ticket.lines.map((l, i) => `${i === 0 ? 'F' : 'M'} ${qty(l.quantity)}`)
  : [qty(props.ticket.lines[0]?.quantity ?? null)])
const price = computed(() => props.ticket.lines.length > 1 ? priceRange(props.ticket.lines.map(l => l.price)) : formatNaira(props.ticket.lines[0]?.price ?? 0))
const description = computed(() => props.ticket.lines.map(l => l.description).find(Boolean) ?? '')
</script>

<template>
  <article :class="['host-tcard', { 'host-tcard--editing': editing }]" :aria-label="`${ticket.name} ticket${editing ? ', being edited' : ''}`">
    <div class="host-tcard__main">
      <div class="host-tcard__chips">
        <span class="host-tcard__name text-app-small-semibold">{{ ticket.name }}</span>
        <span v-for="c in chips" :key="c" class="host-tcard__qty text-app-xsmall-semibold">
          <img src="/images/host/icon-user-16.svg" alt="" width="16" height="16" />
          <span><span class="host-visually-hidden">Quantity: </span>{{ c }}</span>
        </span>
      </div>
      <div class="host-tcard__text">
        <p class="host-tcard__price text-app-h2-bold">{{ price }}</p>
        <p v-if="description" class="host-tcard__desc text-app-xsmall-regular">{{ description }}</p>
      </div>
    </div>
    <div class="host-tcard__actions">
      <button type="button" class="host-icon-btn" :aria-label="`Edit ${ticket.name}`" @click="$emit('edit')">
        <img src="/images/host/icon-pen-18.svg" alt="" width="16" height="16" />
      </button>
      <button type="button" class="host-icon-btn" :aria-label="`Delete ${ticket.name}`" @click="$emit('delete')">
        <img src="/images/host/icon-delete-18.svg" alt="" width="16" height="16" />
      </button>
    </div>
  </article>
</template>

<style scoped>
.host-tcard {
  display: flex;
  gap: var(--spacing-md);
  padding: calc(var(--spacing-md) - 0.5px);
  border: 0.5px dashed var(--color-action-primary);
  border-radius: 16px;
  background: var(--color-background-primary);
  box-shadow: var(--shadow-host-card);
  transition: background-color 150ms ease;
}
.host-tcard--editing { padding: calc(var(--spacing-md) - 2px); border: var(--border-width-emphasis) solid var(--color-action-primary); background: var(--color-host-selected); }
.host-tcard__main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--spacing-xs); }
.host-tcard__chips { display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacing-xs); }
.host-tcard__name { padding: var(--spacing-micro) var(--spacing-sm); border-radius: var(--radius-pill); background: var(--color-host-empty); color: var(--color-action-primary); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.host-tcard__qty { display: inline-flex; align-items: center; gap: var(--spacing-xxs); padding: var(--spacing-xxs) var(--spacing-sm); border-radius: var(--radius-pill); background: var(--color-host-empty); color: var(--color-text-checkout); }
.host-tcard__text { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.host-tcard__price { margin: 0; color: var(--color-text-checkout); }
.host-tcard__desc { margin: 0; color: var(--color-text-muted); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.host-tcard__actions { display: flex; flex-direction: column; gap: var(--spacing-xs); flex: none; }
</style>
