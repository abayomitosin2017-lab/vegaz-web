<script setup lang="ts">
/**
 * UiSkeletonList: placeholder rows for lists while they load (decision
 * 27 Oct): a photo (square or round) and two text lines per row, the second
 * shorter. Used by search results, the community list, My Activities, the
 * chat pop-up and the edition event picker.
 */
withDefaults(defineProps<{ rows?: number; photo?: number; round?: boolean; gap?: string; label?: string }>(), {
  rows: 4, photo: 48, round: false, gap: 'var(--spacing-sm)', label: 'Loading',
})
const widths = [['72%', '48%'], ['58%', '40%'], ['66%', '52%'], ['50%', '36%'], ['62%', '44%']]
</script>

<template>
  <div class="ui-sk-list" role="status" :aria-label="label" :style="{ gap }">
    <div v-for="n in rows" :key="n" class="ui-sk-list__row">
      <UiSkeleton :width="`${photo}px`" :height="`${photo}px`" :radius="round ? 'var(--radius-full)' : 'var(--radius-sm)'" />
      <span class="ui-sk-list__text">
        <UiSkeleton :width="widths[(n - 1) % widths.length]![0]" height="16px" />
        <UiSkeleton :width="widths[(n - 1) % widths.length]![1]" height="12px" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.ui-sk-list { display: flex; flex-direction: column; }
.ui-sk-list__row { display: flex; align-items: center; gap: var(--spacing-sm); }
.ui-sk-list__text { flex: 1; display: flex; flex-direction: column; gap: var(--spacing-xs); min-width: 0; }
</style>
