<script setup lang="ts">
/**
 * EventTicketBar: bar pinned to the bottom of the screen on phones and
 * tablets once at least one ticket is picked (Figma "iPhone 14 & 15 Pro - 26";
 * decision 22 Oct). White, Dp1 shadow, 20px padding.
 * Left: total (Body semibold, 26px line) over "3 Tickets • 2 Tiers"
 * (Small regular Grey_3, 4px dot between). Right: "Buy Ticket" small primary
 * button (40px). Tickets = all quantities added up; Tiers = ticket types with
 * at least one picked (decision 22 Oct).
 */
import { formatNaira } from '~/utils/money'

const props = defineProps<{ total: number; count: number; tiers: number }>()
const emit = defineEmits<{ buy: [] }>()

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const summary = computed(() => `${plural(props.count, 'Ticket')}, ${plural(props.tiers, 'Tier')}`)
</script>

<template>
  <div class="ticket-bar" role="region" aria-label="Your tickets">
    <div class="ticket-bar__info" aria-live="polite" :aria-label="`${formatNaira(total)}, ${summary}`">
      <p class="ticket-bar__total">{{ formatNaira(total) }}</p>
      <p class="ticket-bar__meta text-small-regular" aria-hidden="true">
        {{ plural(count, 'Ticket') }}<span class="ticket-bar__dot" />{{ plural(tiers, 'Tier') }}
      </p>
    </div>
    <UiButton size="small" class="ticket-bar__buy" @click="emit('buy')">Buy Ticket</UiButton>
  </div>
</template>

<style scoped>
.ticket-bar {
  position: fixed;
  inset: auto 0 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-section);
  padding-bottom: calc(var(--spacing-section) + env(safe-area-inset-bottom, 0px));
  background: var(--color-background-primary);
  box-shadow: var(--shadow-dp1);
}
.ticket-bar__info { display: flex; flex-direction: column; gap: var(--spacing-xxs); min-width: 0; }
.ticket-bar__total {
  margin: 0;
  color: var(--color-text-option); /* Figma: black */
  font-size: var(--text-body-semibold-size);
  font-weight: var(--font-weight-semibold);
  line-height: 26px;
}
.ticket-bar__meta { display: flex; align-items: center; gap: var(--spacing-xs); margin: 0; color: var(--color-text-muted); }
.ticket-bar__dot { width: 4px; height: 4px; border-radius: var(--radius-full); background: currentColor; }
.ticket-bar__buy { flex: none; --ui-button-pad-y: 10px; }
</style>
