<script setup lang="ts">
import './styles.css'
import type { DraftTicket } from '~/types/hosting'
/**
 * Side panel "Your tickets" (Figma frames 07-15b): header (Body web
 * semibold + "4 tickets"), then the cards 16 apart, or the empty box
 * (#F4F5F8, radius 16, 40 / 16 padding, ticket drawing, "No ticket has
 * been created yet").
 */
defineProps<{ tickets: DraftTicket[]; editingId: string | null }>()
defineEmits<{ edit: [ticket: DraftTicket]; delete: [ticket: DraftTicket] }>()
</script>

<template>
  <div class="host-side-head">
    <h2 class="host-side-head__title text-body-semibold">Your tickets</h2>
    <span v-if="tickets.length" class="host-side-head__count text-xsmall-regular">{{ tickets.length }} ticket{{ tickets.length === 1 ? '' : 's' }}</span>
  </div>
  <div v-if="!tickets.length" class="host-empty">
    <span class="host-empty__art host-empty__art--tickets" aria-hidden="true"><img src="/images/host/empty-tickets.svg" alt="" width="303" height="96" /></span>
    <p class="host-empty__text text-app-small-semibold">No ticket has been created yet</p>
  </div>
  <TransitionGroup v-else tag="ul" name="host-list" class="host-cards" aria-label="Your tickets">
    <li v-for="t in tickets" :key="t.id">
      <HostTicketCard :ticket="t" :editing="t.id === editingId" @edit="$emit('edit', t)" @delete="$emit('delete', t)" />
    </li>
  </TransitionGroup>
</template>

<style scoped>
.host-cards { display: flex; flex-direction: column; gap: var(--spacing-md); margin: 0; padding: 0; list-style: none; }
</style>
