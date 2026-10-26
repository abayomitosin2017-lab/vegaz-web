<script setup lang="ts">
import './styles.css'
/**
 * Edit date & time (Figma edition frame 05): "What is the new date and
 * time for this edition"; "Date" and "Time" fields stacked (16 apart);
 * "Back" + "Save". Save stays inactive for a past time (error shown under
 * the time, as on the Date & tickets step).
 */
const props = defineProps<{ open: boolean; date: string; time: string }>()
const emit = defineEmits<{ close: []; save: [value: { date: string; time: string }] }>()
const d = ref('')
const t = ref('')
watch(() => props.open, o => { if (o) { d.value = props.date; t.value = props.time } })
const past = computed(() => !!d.value && !!t.value && new Date(`${d.value}T${t.value}:00`).getTime() < Date.now())
const ok = computed(() => !!d.value && !!t.value && !past.value)
</script>

<template>
  <HostDialog :open="open" title="Edit date & time" copy="What is the new date and time for this edition" @close="emit('close')">
    <HostDateTimeFields v-model:date="d" v-model:time="t" stacked />
    <div class="host-dialog__actions host-edit-date__actions">
      <UiButton color="secondary" @click="emit('close')">Back</UiButton>
      <UiButton :class="{ 'host-inactive': !ok }" :color="ok ? 'primary' : 'secondary'" :aria-disabled="!ok ? 'true' : undefined" @click="ok && emit('save', { date: d, time: t })">Save</UiButton>
    </div>
  </HostDialog>
</template>

<style scoped>
.host-edit-date__actions { margin-top: var(--spacing-xs); }
</style>
