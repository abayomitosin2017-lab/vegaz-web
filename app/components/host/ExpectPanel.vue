<script setup lang="ts">
import './styles.css'
import type { DraftExpectation } from '~/types/hosting'
/**
 * Side panel "Your list" (Figma frames 17-19). Header + "3 items"; each
 * item: 64px picture (radius 12), title Small app semibold #2C2C2C,
 * description Small app regular Grey_2 (8 apart), edit and delete 34px
 * round buttons; 16 apart. Empty: list drawing + "Items you add will show
 * here". The item being edited gets the #ECEFFE fill (as tickets).
 */
defineProps<{ items: DraftExpectation[]; editingId: string | null }>()
defineEmits<{ edit: [item: DraftExpectation]; delete: [item: DraftExpectation] }>()
</script>

<template>
  <div class="host-side-head">
    <h2 class="host-side-head__title text-body-semibold">Your list</h2>
    <span v-if="items.length" class="host-side-head__count text-xsmall-regular">{{ items.length }} item{{ items.length === 1 ? '' : 's' }}</span>
  </div>
  <div v-if="!items.length" class="host-empty">
    <img class="host-empty__art" src="/images/host/empty-list.svg" alt="" width="95" height="75" />
    <p class="host-empty__text text-app-small-semibold">Items you add will show here</p>
  </div>
  <TransitionGroup v-else tag="ul" name="host-list" class="host-expect-list" aria-label="Your list">
    <li v-for="item in items" :key="item.id" :class="['host-expect-item', { 'host-expect-item--editing': item.id === editingId }]">
      <span class="host-expect-item__pic">
        <img v-if="item.imageUrl" :src="item.imageUrl" alt="" />
      </span>
      <span class="host-expect-item__text">
        <span class="host-expect-item__title text-app-small-semibold">{{ item.title }}</span>
        <span class="host-expect-item__desc text-app-small-regular">{{ item.description }}</span>
      </span>
      <span class="host-expect-item__actions">
        <button type="button" class="host-icon-btn" :aria-label="`Edit ${item.title}`" @click="$emit('edit', item)">
          <img src="/images/host/icon-pen-18.svg" alt="" width="16" height="16" />
        </button>
        <button type="button" class="host-icon-btn" :aria-label="`Delete ${item.title}`" @click="$emit('delete', item)">
          <img src="/images/host/icon-delete-18.svg" alt="" width="16" height="16" />
        </button>
      </span>
    </li>
  </TransitionGroup>
</template>

<style scoped>
.host-expect-list { display: flex; flex-direction: column; gap: var(--spacing-md); margin: 0; padding: 0; list-style: none; }
.host-expect-item { display: flex; align-items: center; gap: var(--spacing-md); min-height: 80px; border-radius: var(--radius-md); transition: background-color 150ms ease; }
.host-expect-item--editing { margin: calc(-1 * var(--spacing-xs)); padding: calc(var(--spacing-xs) - 2px); border: var(--border-width-emphasis) solid var(--color-action-primary); background: var(--color-host-selected); }
.host-expect-item__pic { flex: none; width: 64px; height: 64px; overflow: hidden; border-radius: var(--radius-md); background: var(--color-host-empty); }
.host-expect-item__pic img { width: 100%; height: 100%; object-fit: cover; display: block; }
.host-expect-item__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--spacing-xs); }
.host-expect-item__title { color: var(--color-text-primary); }
.host-expect-item__desc { color: var(--color-text-secondary); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.host-expect-item__actions { flex: none; display: flex; flex-direction: column; gap: var(--spacing-xs); }
</style>
