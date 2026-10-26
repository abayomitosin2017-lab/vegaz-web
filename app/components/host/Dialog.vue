<script setup lang="ts">
import './styles.css'
/**
 * Short picker dialog used by the host flow (decision 23 Oct: Location,
 * Categories, Participants, Delete ticket, Edit event details, Edit date &
 * time stay as small dialogs). Built on UiModal: 441px white card, radius
 * 24, padding 24, page dimmed with white at 70%.
 * Header (Figma): title H2 app bold 24/32 #141316, copy Small app regular
 * Grey_2, 4 apart; 16px close X top right. Sections 24 apart.
 */
const props = withDefaults(defineProps<{ open: boolean; title: string; copy?: string; width?: number; hideHeader?: boolean }>(), { copy: undefined, width: 441, hideHeader: false })
const emit = defineEmits<{ close: [] }>()
const id = useId()
</script>

<template>
  <UiModal :open="open" :width="width" :labelledby="`${id}-title`" phone="sheet" @close="emit('close')">
    <div class="host-dialog">
      <div v-if="!hideHeader" class="host-dialog__head">
        <div class="host-dialog__titles">
          <h2 :id="`${id}-title`" class="host-dialog__title text-app-h2-bold">{{ title }}</h2>
          <p v-if="copy" class="host-dialog__copy text-app-small-regular">{{ copy }}</p>
        </div>
        <button type="button" class="host-dialog__close" aria-label="Close" @click="emit('close')">
          <img src="/images/host/icon-close-16.svg" alt="" width="16" height="16" />
        </button>
      </div>
      <slot :title-id="`${id}-title`" />
    </div>
  </UiModal>
</template>
