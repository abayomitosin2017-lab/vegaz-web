<script setup lang="ts">
import './styles.css'
/**
 * Phone "Create event" sheet (Figma mobile 10754:75731, over Home): bottom
 * sheet, radius 24 top, 24 / 16 padding. "Create event" (Headline 2 bold
 * Grey_1) + "How would you like to create your next event?" (Body regular
 * Grey_3), 16px X. Two rows (24px icon, title + description, 16px chevron)
 * with Grey_5 lines under each: tapping a row opens that flow.
 * Desktop uses the choice page (/host) instead.
 */
defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const id = useId()
function go(path: string) { emit('close'); navigateTo(path) }
</script>

<template>
  <UiModal :open="open" :width="441" :labelledby="`${id}-t`" phone="sheet" card-class="host-choice-sheet" @close="emit('close')">
    <div class="host-csheet">
      <div class="host-csheet__head">
        <h2 :id="`${id}-t`" class="host-csheet__title text-app-h2-bold">Create event</h2>
        <p class="host-csheet__copy text-app-body-regular">How would you like to create your next event?</p>
        <button type="button" class="host-csheet__close" aria-label="Close" @click="emit('close')"><img src="/images/host/icon-close-16.svg" alt="" width="16" height="16" /></button>
      </div>
      <ul class="host-csheet__list">
        <li>
          <button type="button" class="host-csheet__row" data-autofocus @click="go('/host/new')">
            <img src="/images/host/icon-pen-32.svg" alt="" width="24" height="24" />
            <span class="host-csheet__text">
              <span class="host-csheet__name text-app-body-semibold">Start fresh event</span>
              <span class="host-csheet__desc text-app-small-regular">Create a brand new event</span>
            </span>
            <img src="/images/host/m-arrow-right-16.svg" alt="" width="16" height="16" />
          </button>
        </li>
        <li>
          <button type="button" class="host-csheet__row host-csheet__row--top" @click="go('/host/edition')">
            <img src="/images/host/icon-restart-32.svg" alt="" width="24" height="24" />
            <span class="host-csheet__text">
              <span class="host-csheet__name text-app-small-semibold">Use existing event</span>
              <span class="host-csheet__desc text-app-small-regular">An event with existing chat room and members, recommended for a new edition of an event</span>
            </span>
            <img src="/images/host/m-arrow-right-16.svg" alt="" width="16" height="16" />
          </button>
        </li>
      </ul>
    </div>
  </UiModal>
</template>

<style scoped>
.host-csheet { display: flex; flex-direction: column; gap: var(--spacing-lg); }
.host-csheet__head { position: relative; display: flex; flex-direction: column; gap: var(--spacing-xxs); padding-right: var(--spacing-lg); }
.host-csheet__title { margin: 0; color: var(--color-text-strong); }
.host-csheet__copy { margin: 0; color: var(--color-text-secondary) /* body Grey_2 (decision 27 Oct) */; }
.host-csheet__close { position: absolute; right: 0; top: -6px; display: inline-flex; padding: 0; border: 0; background: none; cursor: pointer; border-radius: var(--radius-pill); }
.host-csheet__close:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
.host-csheet__list { display: flex; flex-direction: column; gap: var(--spacing-md); margin: 0; padding: 0; list-style: none; }
.host-csheet__list li { display: flex; flex-direction: column; gap: var(--spacing-md); }
.host-csheet__list li::after { content: ''; align-self: flex-end; width: calc(100% - 40px); height: 1px; background: var(--color-border-default); }
.host-csheet__row { display: flex; align-items: center; gap: var(--spacing-md); width: 100%; min-height: 48px; padding: 0; border: 0; background: none; text-align: left; font-family: var(--font-family-base); cursor: pointer; border-radius: var(--radius-sm); }
.host-csheet__row--top { align-items: flex-start; }
.host-csheet__row--top > img:last-child { align-self: center; }
.host-csheet__row:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 4px; }
.host-csheet__row > img { flex: none; }
.host-csheet__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.host-csheet__row--top .host-csheet__text { gap: var(--spacing-xxs); }
.host-csheet__name { color: var(--color-text-primary); }
.host-csheet__desc { color: var(--color-text-muted); }
</style>
