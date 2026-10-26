<script setup lang="ts">
import './styles.css'
/**
 * Left rail of the host flow (Figma "Host / Step" component set 10787:20160).
 *
 * 360px, Grey_6, padding 48 / 40, items 32 apart.
 * Title "Create new event" (H3 web bold 24/32); "Step n of N" (x-Small web
 * semibold 14/18, secondary) over a 6px Grey_5 bar with a Primary fill.
 * Each step: 32px circle + title (Small web semibold 16/24) and description
 * (x-Small web regular 14/18, secondary), 16 apart, text 4px lower.
 *   Done      Primary circle with a white 16px tick
 *   Current   Primary circle with the white number
 *   Upcoming  white circle, 1px Grey_5 border, secondary number; title secondary
 * Connectors: 2 x 24 bars, 15px from the left, 4px above and below;
 * Primary under a done step, Grey_5 otherwise.
 */
export interface HostStep { title: string; description: string }
const props = defineProps<{ title: string; steps: HostStep[]; current: number }>()

const state = (i: number) => (i < props.current ? 'done' : i === props.current ? 'current' : 'upcoming')
const progress = computed(() => `${((props.current + 1) / props.steps.length) * 100}%`)
</script>

<template>
  <aside class="host-rail" aria-label="Progress">
    <h1 class="host-rail__title text-h3-bold">{{ title }}</h1>
    <div class="host-rail__progress">
      <p class="host-rail__count text-xsmall-semibold">Step {{ current + 1 }} of {{ steps.length }}</p>
      <div class="host-rail__bar" aria-hidden="true"><span :style="{ width: progress }" /></div>
    </div>
    <ol class="host-rail__steps">
      <li v-for="(step, i) in steps" :key="step.title" :class="['host-rail__step', `host-rail__step--${state(i)}`]" :aria-current="i === current ? 'step' : undefined">
        <div class="host-rail__row">
          <span class="host-rail__dot text-xsmall-semibold" aria-hidden="true">
            <img v-if="state(i) === 'done'" src="/images/host/icon-check-16.svg" alt="" width="16" height="16" />
            <template v-else>{{ i + 1 }}</template>
          </span>
          <span class="host-rail__text">
            <span class="host-rail__step-title text-small-semibold">{{ step.title }}<span class="host-visually-hidden">{{ state(i) === 'done' ? ', done' : state(i) === 'current' ? ', current step' : '' }}</span></span>
            <span class="host-rail__step-copy text-xsmall-regular">{{ step.description }}</span>
          </span>
        </div>
        <span v-if="i < steps.length - 1" class="host-rail__line" aria-hidden="true" />
      </li>
    </ol>
  </aside>
</template>

<style scoped>
.host-rail {
  box-sizing: border-box;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  width: var(--sizing-host-rail);
  padding: var(--spacing-3xl) var(--spacing-2xl);
  overflow-y: auto;
  background: var(--color-background-secondary);
}
.host-rail__title { margin: 0; color: var(--color-text-primary); }
.host-rail__progress { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.host-rail__count { margin: 0; color: var(--color-text-secondary); }
.host-rail__bar { height: 6px; border-radius: 3px; background: var(--color-border-default); overflow: hidden; }
.host-rail__bar span { display: block; height: 100%; border-radius: 3px; background: var(--color-action-primary); transition: width 250ms var(--ease-out-strong); }

.host-rail__steps { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; }
.host-rail__row { display: flex; gap: var(--spacing-md); }
.host-rail__dot {
  box-sizing: border-box;
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: var(--color-action-primary);
  color: var(--base-white);
}
.host-rail__step--upcoming .host-rail__dot {
  border: var(--border-width-default) solid var(--color-border-default);
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
}
.host-rail__text { display: flex; flex-direction: column; padding-top: var(--spacing-xxs); min-width: 0; }
.host-rail__step-title { color: var(--color-text-primary); }
.host-rail__step--upcoming .host-rail__step-title { color: var(--color-text-secondary); }
.host-rail__step-copy { color: var(--color-text-secondary); }
.host-rail__line { display: block; width: 2px; height: 24px; margin: var(--spacing-xxs) 0 var(--spacing-xxs) 15px; background: var(--color-border-default); }
.host-rail__step--done .host-rail__line { background: var(--color-action-primary); }

@media (prefers-reduced-motion: reduce) { .host-rail__bar span { transition: none; } }
</style>
