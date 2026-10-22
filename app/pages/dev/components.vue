<script setup lang="ts">
/**
 * DEV PREVIEW (not an app screen): components built ahead of the next page,
 * shown with mock data so design can review them. Remove or protect this
 * route before release.
 * Ticket option card: Figma Component 13 (node 9832:32993), all 5 variants.
 */
import type { TicketType } from '~/types/ticket'
import { getPreviewQuantities, getTicketTypes } from '~/services/tickets'

definePageMeta({ layout: false })
useHead({ title: 'Vegaz components (preview)', meta: [{ name: 'robots', content: 'noindex' }] })

const { data: tickets } = await useAsyncData<TicketType[]>('preview-tickets', () => getTicketTypes('preview'))
const quantities = ref<Record<string, number>>(getPreviewQuantities())
const labels: Record<string, string> = {
  't-free': 'free', 't-table2': 'custom', 't-vip': 'vip', 't-vip-low': 'reminder (low stock)', 't-vip-sold': 'sold out',
}
</script>

<template>
  <main class="preview">
    <header class="preview__intro">
      <h1 class="text-h3-semibold">Ticket option</h1>
      <p class="text-small-regular">Figma Component 13. Try the − and + buttons; the low-stock card stops at 5.</p>
    </header>
    <div class="preview__list">
      <section v-for="t in tickets" :key="t.id" class="preview__item">
        <p class="preview__label">{{ labels[t.id] }}</p>
        <TicketOption v-model:quantity="quantities[t.id]" :ticket="t" />
      </section>
    </div>
  </main>
</template>

<style scoped>
.preview {
  min-height: 100vh;
  padding: var(--spacing-xl) var(--container-inset-mobile) var(--spacing-4xl);
  background: var(--color-border-strong); /* preview backdrop, similar to the Figma canvas */
}
.preview__intro { max-width: 415px; margin: 0 auto var(--spacing-lg); color: var(--color-text-primary); }
.preview__intro p { color: var(--color-text-strong); margin-top: var(--spacing-xxs); }
.preview__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 415px; /* Figma component width */
  margin-inline: auto;
}
.preview__label {
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  font-size: var(--text-xsmall-semibold-size);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--text-label-tracking);
}
</style>
