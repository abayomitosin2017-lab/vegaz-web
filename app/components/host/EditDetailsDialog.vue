<script setup lang="ts">
import './styles.css'
/**
 * Edit event details (Figma edition frame 04): "Edit event title and
 * description for this edition"; "Event Title" and "Description" fields
 * (16 apart; description 140 tall in total); "Back" + "Save" (half width
 * each, 16 apart), 32 below the fields.
 */
const props = defineProps<{ open: boolean; title: string; description: string }>()
const emit = defineEmits<{ close: []; save: [value: { title: string; description: string }] }>()
const t = ref('')
const d = ref('')
watch(() => props.open, o => { if (o) { t.value = props.title; d.value = props.description } })
const id = useId()
</script>

<template>
  <HostDialog :open="open" title="Edit event details" copy="Edit event title and description for this edition" @close="emit('close')">
    <div class="host-edit">
      <div class="host-field">
        <label :for="`${id}-t`" class="host-field__label text-app-small-semibold">Event Title</label>
        <input :id="`${id}-t`" v-model="t" class="host-input" type="text" maxlength="60" placeholder="What is your event title?" data-autofocus />
      </div>
      <div class="host-field">
        <label :for="`${id}-d`" class="host-field__label text-app-small-semibold">Description</label>
        <textarea :id="`${id}-d`" v-model="d" class="host-input host-edit__desc" rows="3" placeholder="Give short description of your event" />
      </div>
    </div>
    <div class="host-dialog__actions host-edit__actions">
      <UiButton color="secondary" @click="emit('close')">Back</UiButton>
      <UiButton :class="{ 'host-inactive': !t.trim() }" :color="t.trim() ? 'primary' : 'secondary'" :aria-disabled="!t.trim() ? 'true' : undefined" @click="t.trim() && emit('save', { title: t.trim(), description: d.trim() })">Save</UiButton>
    </div>
  </HostDialog>
</template>

<style scoped>
.host-edit { display: flex; flex-direction: column; gap: var(--spacing-md); }
.host-edit__desc { height: 112px; }
.host-edit__actions { margin-top: var(--spacing-xs); }
</style>
