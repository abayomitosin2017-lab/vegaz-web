<script setup lang="ts">
/**
 * UiErrorState: "couldn't load" in place of the content, with Try again
 * (decision 27 Oct: in place, header and footer stay; NOT IN FIGMA, PROPOSED).
 * Copy switches when the device is offline:
 *   online:  "Something went wrong" / "We couldn't load this. Please try again."
 *   offline: "You're offline" / "Check your internet connection and try again."
 * `what` names the thing ("events", "messages") in the text.
 * Try again shows "Trying…" while the page retries.
 */
const props = withDefaults(defineProps<{ what?: string; compact?: boolean; level?: 1 | 2 | 3 | 4; retrying?: boolean }>(), { what: 'this', level: 3 })
const emit = defineEmits<{ retry: [] }>()
const online = useOnline()

const title = computed(() => (online.value ? 'Something went wrong' : 'You’re offline'))
const text = computed(() => (online.value
  ? `We couldn’t load ${props.what}. Please try again.`
  : 'Check your internet connection and try again.'))
</script>

<template>
  <UiStateMessage
    :icon="online ? '/images/states/icon-danger-32.svg' : '/images/states/icon-wifi-off-32.svg'"
    :title="title"
    :text="text"
    :action-label="retrying ? 'Trying…' : 'Try again'"
    :busy="retrying"
    :compact="compact"
    :level="level"
    live="alert"
    @action="emit('retry')"
  />
</template>
