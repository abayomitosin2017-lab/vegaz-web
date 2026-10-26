<script setup lang="ts">
/**
 * ChatList: left column of the chat page (Figma "Desktop - 54", 10669:50340).
 * "Chats" title (hidden from view, decision 22 Oct; kept for screen readers),
 * "Search chats" field (filters by event title), then one row
 * per event chat.
 *
 * Row (Figma): 48px event photo (radius 8), 12px gap, title Web Body semibold
 * + time on the first line, last message Web Small regular + unread badge on
 * the second. Rows are 16px apart with a line between them (starts 43px in,
 * as drawn).
 *   unread: time in Primary purple, preview Grey_2, red count badge
 *   read:   time Grey_4, preview Grey_3, no badge
 * FLAG: Figma rows vary (52/58/72px tall, three preview greys, two time greys);
 * normalised to the two states above, 52px rows.
 * Proposed (not in Figma): hover and selected rows get a Grey_6 background.
 *
 * Phones (< 768px, Figma "chat" list 10683:54774): 16px page margins,
 * no visible "Chats" title (decision 21 Oct; kept for screen readers), search field with 12px corners and "Search events"
 * (Figma "Search hangouts", copy rule 21 Oct), 40px photos, 14px between rows
 * and lines, previews up to 2 lines; unread previews show the sender in Grey_2
 * and the message darker (#141316).
 */
import type { ChatSummary } from '~/types/chat'
import { formatCount, formatListTime } from '~/utils/chatFormat'

const props = defineProps<{ chats: ChatSummary[]; selectedId?: string | null; loading?: boolean }>()
const emit = defineEmits<{ select: [id: string] }>()

const phone = usePhoneLayout()
const query = ref('')
const visible = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? props.chats.filter(c => c.title.toLowerCase().includes(q)) : props.chats
})
</script>

<template>
  <section class="chat-list" aria-labelledby="chat-list-title">
    <h1 id="chat-list-title" class="chat-list__title text-h3-bold">Chats</h1>

    <UiInput
      v-if="chats.length"
      v-model="query"
      type="search"
      text-style="web"
      filled
      class="chat-list__search"
      :placeholder="phone ? 'Search events' : 'Search chats'"
      aria-label="Search chats"
    >
      <template #icon><img src="/images/chat/icon-search-20.svg" alt="" width="16" height="16" /></template>
    </UiInput>

    <ul v-if="visible.length" class="chat-list__rows">
      <li v-for="chat in visible" :key="chat.id" class="chat-list__item">
        <button
          type="button"
          :class="['chat-row', { 'chat-row--unread': chat.unreadCount > 0, 'chat-row--selected': chat.id === selectedId }]"
          :aria-current="chat.id === selectedId ? 'true' : undefined"
          @click="emit('select', chat.id)"
        >
          <span class="chat-row__photo">
            <img v-if="chat.imageUrl" :src="chat.imageUrl" alt="" />
          </span>
          <span class="chat-row__text">
            <span class="chat-row__line">
              <span class="chat-row__name text-body-semibold">{{ chat.title }}</span>
              <span class="chat-row__time text-xsmall-semibold">{{ formatListTime(chat.lastAt) }}</span>
            </span>
            <span class="chat-row__line">
              <span class="chat-row__preview text-small-regular"><span class="chat-row__sender">{{ chat.lastMessage.senderFirstName }}:</span> {{ chat.lastMessage.text }}</span>
              <span v-if="chat.unreadCount > 0" class="chat-row__badge text-xsmall-semibold">
                {{ formatCount(chat.unreadCount) }}<span class="visually-hidden"> unread</span>
              </span>
            </span>
          </span>
        </button>
      </li>
    </ul>

    <!-- Search with no match (copy not in Figma) -->
    <p v-else-if="chats.length" class="chat-list__note text-small-regular">No chats match “{{ query.trim() }}”</p>

    <!-- No chats at all (empty state, decision 21 Oct) -->
    <div v-else-if="!loading" class="chat-list__empty">
      <p class="text-body-semibold chat-list__empty-title">No chats yet</p>
      <p class="text-small-regular chat-list__note">Chats from events you join show up here.</p>
    </div>
  </section>
</template>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  min-height: 0;
}
/* Decision 21-22 Oct: no visible "Chats" title (phones and desktop). It stays
   for screen readers as the page heading but takes no space. */
.chat-list__title {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.chat-list__rows {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-height: 0;
  margin: 0;
  /* room for the selected-row background (8px) inside the scroll area */
  padding: var(--spacing-xs);
  margin: calc(-1 * var(--spacing-xs));
  overflow-y: auto;
  list-style: none;
}
.chat-list__item { display: flex; flex-direction: column; gap: var(--spacing-md); }
/* Line between rows (Figma: 1px, from 43px to the right edge) */
.chat-list__item + .chat-list__item::before {
  content: '';
  display: block;
  height: 0;
  margin-left: 43px;
  margin-bottom: calc(-1 * var(--border-width-default)); /* line takes no space, as in Figma */
  border-top: var(--border-width-default) solid var(--color-chat-divider);
}

.chat-row {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
/* Proposed: hover / selected background, drawn 8px outside the row so the
   row itself keeps Figma's size */
.chat-row::before {
  content: '';
  position: absolute;
  inset: calc(-1 * var(--spacing-xs));
  z-index: -1;
  border-radius: var(--radius-md);
}
.chat-row:hover::before,
.chat-row--selected::before { background: var(--color-background-secondary); }
.chat-row:focus-visible { outline: none; }
.chat-row:focus-visible::before { outline: var(--focus-ring-width) solid var(--focus-ring-color); }

.chat-row__photo {
  flex: none;
  width: var(--sizing-control-standard);
  height: var(--sizing-control-standard);
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--color-placeholder-media);
}
.chat-row__photo img { width: 100%; height: 100%; object-fit: cover; }

.chat-row__text { display: flex; flex: 1; flex-direction: column; min-width: 0; }
.chat-row__line {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-xs);
  min-width: 0;
}
/* Badge sits centred against the 24px preview line */
.chat-row__line + .chat-row__line { align-items: center; }
.chat-row__name,
.chat-row__preview {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chat-row__name { color: var(--color-text-primary); }
.chat-row__time { flex: none; color: var(--color-chat-time-read); }
.chat-row--unread .chat-row__time { color: var(--color-chat-time-unread); }
.chat-row__preview { color: var(--color-chat-preview-read); }
.chat-row--unread .chat-row__preview { color: var(--color-chat-preview-unread); }
.chat-row__badge {
  flex: none;
  padding-inline: var(--spacing-compact);
  border-radius: var(--radius-pill);
  background: var(--color-status-error);
  color: var(--color-text-inverse);
}

.chat-list__note { margin: 0; color: var(--color-text-muted); }
.chat-list__empty { display: flex; flex-direction: column; gap: var(--spacing-xxs); }
.chat-list__empty-title { margin: 0; color: var(--color-text-primary); }

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- Phones (< 768px) ---- */
@media (max-width: 767px) {
  .chat-list { padding: var(--spacing-lg) var(--spacing-md) 0; }
  .chat-list__search { border-radius: var(--radius-md); }
  .chat-list__rows,
  .chat-list__item { gap: 14px; /* Figma */ }
  .chat-row__photo { width: var(--sizing-control-compact); height: var(--sizing-control-compact); }
  .chat-row__preview {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    white-space: normal;
  }
  .chat-row--unread .chat-row__preview { color: var(--color-text-field); }
  .chat-row--unread .chat-row__sender { color: var(--color-chat-preview-unread); }
}
</style>
