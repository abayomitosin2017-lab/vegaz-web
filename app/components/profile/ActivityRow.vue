<script setup lang="ts">
import './styles.css'
import type { ActivityItem } from '~/types/profile'
/**
 * One event on Activities (Figma 10834:28046; same row on the web modal).
 * Row 16 top/bottom; 60px picture (radius 12), 16 gap; title Body bold
 * #2C2C2C (one line, cut with "…"), then 4 below: date + city (Small regular
 * Grey_3); 8 below: "8 [female memoji] 5 [male memoji]" (x-Small semibold,
 * 20px memojis) and, 12 after, a chip (#F4F5F8, 0.5px Grey_5, radius 40,
 * 1/10 padding, x-Small semibold): "5 Slots left", or "Ended" for past
 * events (PROPOSED, not drawn). 24px chevron on the right.
 * The whole row opens the event page.
 */
const props = defineProps<{ item: ActivityItem }>()
const emit = defineEmits<{ open: [eventId: string] }>()
const chip = computed(() => props.item.ended ? 'Ended' : props.item.slotsLeft === null ? '' : `${props.item.slotsLeft} ${props.item.slotsLeft === 1 ? 'Slot' : 'Slots'} left`)
const people = computed(() => `${props.item.femaleCount} ${props.item.femaleCount === 1 ? 'woman' : 'women'}, ${props.item.maleCount} ${props.item.maleCount === 1 ? 'man' : 'men'}`)
</script>

<template>
  <NuxtLink :to="`/events/${item.eventId}`" class="profile-arow" @click="emit('open', item.eventId)">
    <span class="profile-arow__main">
      <span class="profile-arow__pic">
        <img v-if="item.imageUrl" :src="item.imageUrl" alt="" width="60" height="60" loading="lazy" />
      </span>
      <span class="profile-arow__text">
        <span class="profile-arow__title">{{ item.title }}</span>
        <span class="profile-arow__meta">
          <span class="profile-arow__date text-app-small-regular">{{ item.dateLine }}</span>
          <span class="profile-arow__facts">
            <span class="profile-arow__people text-app-xsmall-semibold" :aria-label="people">
              <span aria-hidden="true">{{ item.femaleCount }}</span>
              <img src="/images/auth/memoji-female.svg" alt="" width="20" height="20" aria-hidden="true" />
              <span class="profile-arow__gap" aria-hidden="true">{{ item.maleCount }}</span>
              <img src="/images/auth/memoji-male.svg" alt="" width="20" height="20" aria-hidden="true" />
            </span>
            <span v-if="chip" class="profile-arow__chip text-app-xsmall-semibold">{{ chip }}</span>
          </span>
        </span>
      </span>
    </span>
    <img class="profile-arow__chev" src="/images/profile/icon-chevron-right-24.svg" alt="" width="24" height="24" />
  </NuxtLink>
</template>

<style scoped>
.profile-arow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) 0;
  color: inherit;
  text-decoration: none;
  border-radius: var(--radius-md);
}
.profile-arow:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
@media (hover: hover) { .profile-arow:hover .profile-arow__title { color: var(--color-action-primary); } } /* PROPOSED */
.profile-arow__main { flex: 1 1 0; min-width: 0; display: flex; align-items: flex-start; gap: var(--spacing-md); }
.profile-arow__pic { flex: none; width: 60px; height: 60px; overflow: hidden; border-radius: var(--radius-md); background: var(--color-host-empty); }
.profile-arow__pic img { display: block; width: 100%; height: 100%; object-fit: cover; }
.profile-arow__text { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: var(--spacing-xxs); }
.profile-arow__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-weight: var(--text-app-body-semibold-weight);
  font-size: var(--text-app-body-semibold-size);
  line-height: var(--text-app-body-semibold-line);
  transition: color 150ms ease;
}
.profile-arow__meta { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.profile-arow__date { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-text-muted); }
.profile-arow__facts { display: flex; align-items: center; gap: var(--spacing-sm); }
.profile-arow__people { display: inline-flex; align-items: center; color: var(--color-text-primary); }
.profile-arow__people img { width: 20px; height: 20px; }
.profile-arow__gap { margin-left: 6px; }
.profile-arow__chip {
  padding: 1px 10px;
  border: 0.5px solid var(--color-border-default);
  border-radius: var(--radius-pill);
  background: var(--color-host-empty);
  color: var(--color-text-primary);
  white-space: nowrap;
}
.profile-arow__chev { flex: none; width: 24px; height: 24px; }
</style>
