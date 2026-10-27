<script setup lang="ts">
/**
 * EventTicketBar: bar pinned to the bottom of the screen on phones and
 * tablets once at least one ticket is picked (Figma "iPhone 14 & 15 Pro - 26";
 * decision 22 Oct). Redesigned 27 Oct from Airbnb's booking bar (measured on
 * airbnb.com at 375: 48-tall button, 16/20 text, 24 sides) and made clearer:
 * - White, 16 above / below (+ the phone's safe area), page margins at the
 *   sides; a hairline and a soft shadow on top so it lifts off white pages.
 * - Left: total 18/24 bold Grey_1 ("Free" when nothing to pay) over
 *   "3 tickets · 2 tiers" (14/18 regular Grey_2).
 * - Right: the main action, standard 48 button (16/20, 24 sides, at least
 *   148 wide): "Buy Ticket", or "RSVP" when only free tickets are picked
 *   (decision 26 Oct).
 * Tapping anywhere on the bar except the button scrolls to the tickets
 * (emits `show`, decision 27 Oct).
 * Tickets = all quantities added up; Tiers = ticket types with at least one
 * picked (decision 22 Oct).
 */
import { formatNaira } from '~/utils/money'

const props = defineProps<{ total: number; count: number; tiers: number; free?: boolean }>()
const emit = defineEmits<{ buy: []; show: [] }>()

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const summary = computed(() => `${plural(props.count, 'ticket')} · ${plural(props.tiers, 'tier')}`)
// Lift the chat dock (tablets) above this bar while it shows
const { bottomOffset } = useChatDock()
const barEl = ref<HTMLElement | null>(null)
// and leave room under the page (footer included) so nothing hides behind it
onMounted(() => {
  const h = barEl.value?.offsetHeight ?? 0
  bottomOffset.value = h
  document.body.style.paddingBottom = `${h}px`
})
onBeforeUnmount(() => {
  bottomOffset.value = 0
  document.body.style.paddingBottom = ''
})
</script>

<template>
  <!-- Tapping the bar (not the button) scrolls to the tickets (decision 27 Oct) -->
  <div ref="barEl" class="ticket-bar" role="region" aria-label="Your tickets" @click="emit('show')">
    <button type="button" class="ticket-bar__info" aria-live="polite" :aria-label="`${total > 0 ? formatNaira(total) : 'Free'}, ${summary}. Show tickets`">
      <span class="ticket-bar__total">{{ total > 0 ? formatNaira(total) : 'Free' }}</span>
      <span class="ticket-bar__meta">{{ summary }}</span>
    </button>
    <UiButton class="ticket-bar__buy" text-style="web" @click.stop="emit('buy')">{{ free ? 'RSVP' : 'Buy Ticket' }}</UiButton>
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
  padding: var(--spacing-md) var(--container-inset-mobile) calc(var(--spacing-md) + env(safe-area-inset-bottom, 0px));
  border-top: var(--border-width-default) solid rgba(25, 27, 31, 0.06);
  background: var(--color-background-primary);
  box-shadow: 0 -4px 16px rgba(17, 17, 26, 0.06); /* soft lift on white (decision 27 Oct) */
}
.ticket-bar { cursor: pointer; -webkit-tap-highlight-color: transparent; }
.ticket-bar__info { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; min-width: 0; padding: 0; border: 0; border-radius: var(--radius-sm); background: none; text-align: left; cursor: pointer; }
.ticket-bar__info:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 4px; }
.ticket-bar__total {
  display: block;
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ticket-bar__meta {
  margin: 0;
  color: var(--color-text-secondary);
  font-family: var(--font-family-base);
  font-size: 14px;
  line-height: 18px;
  white-space: nowrap;
}
.ticket-bar__buy { flex: none; min-width: 148px; }
@media (min-width: 768px) {
  .ticket-bar { padding-inline: var(--container-detail-inset-tablet); }
}
</style>
