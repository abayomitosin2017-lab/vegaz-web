<script setup lang="ts">
/**
 * EventAddToCalendar: small grey "Add to calendar" button beside the date
 * (decision 27 Oct; not in Figma). Same small secondary button as "Join
 * Community for free". Opens a menu: Google Calendar, Apple Calendar (.ics
 * file, also works for other calendar apps) and Outlook.
 * Times: see utils/calendar.ts (no end time yet, OPEN ITEM).
 */
import { googleCalendarUrl, icsFile, outlookCalendarUrl, type CalendarEvent } from '~/utils/calendar'
import type { DropdownItem } from '~/components/ui/DropdownMenu.vue'

const props = defineProps<{ event: CalendarEvent; id: string }>()

const items: DropdownItem[] = [
  { id: 'google', label: 'Google Calendar' },
  { id: 'apple', label: 'Apple Calendar' },
  { id: 'outlook', label: 'Outlook' },
]

function onSelect(choice: string) {
  if (choice === 'google') window.open(googleCalendarUrl(props.event), '_blank', 'noopener')
  else if (choice === 'outlook') window.open(outlookCalendarUrl(props.event), '_blank', 'noopener')
  else {
    const blob = new Blob([icsFile(props.event, props.id)], { type: 'text/calendar;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${props.id}.ics`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
}
</script>

<template>
  <UiDropdownMenu :items="items" label="Add to calendar" :width="200" class="add-cal" @select="onSelect">
    <template #trigger="{ props: trigger }">
      <UiButton v-bind="trigger" size="small" color="secondary" class="add-cal__button">Add to calendar</UiButton>
    </template>
  </UiDropdownMenu>
</template>

<style scoped>
.add-cal { flex: none; }
.add-cal__button {
  /* Compact pill so the date row lines up with the address and price rows
     (decision 27 Oct): 28 tall like the Figma pill (14/20 text, 4 above and
     below), 12 sides */
  --ui-button-pad-y: 4px;
  --ui-button-pad-x: 12px;
  --ui-button-min-height: 28px;
  white-space: nowrap;
  font-size: var(--text-small-semibold-size);
  line-height: 20px;
}
.add-cal__button :deep(.ui-button__label) { font-size: inherit; line-height: inherit; }
</style>
