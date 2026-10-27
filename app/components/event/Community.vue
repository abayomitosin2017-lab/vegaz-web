<script setup lang="ts">
/**
 * EventCommunity: "Community (24)" with "Invite Friend", then a row of people
 * (Figma event details, "Avatar 2" instances).
 *
 * Title: "Community" Headline 3 semibold + " (24)" regular Grey_2.
 * "View all" (was "Invite Friend", decision 27 Oct): Web Small semibold
 * Primary, 8px padding; opens the community list (EventCommunityModal).
 * "+N Others" opens it too.
 * Person (80px wide): 48px photo or letter avatar; the host gets a green
 * "Host" pill (Sub, white, 2px white edge) overlapping the photo by 16px;
 * an 18px gender tag (F pink / M, 2px white edge, 10px semibold letter) at
 * the photo's top right (decision 27 Oct; was 12 / 6px);
 * name 14/18 regular #141316 at every width, one line with "..."
 * (Figma 10713:56670, 22 Oct; was 12/18, phones 10/14).
 * Last: "+N Others" (48px #F0F0F0 circle, 18/28 semibold #4E4E4E).
 * Gender letter: 6px Regular (was Light).
 * People are not clickable (decision 22 Oct, replaces opening their
 * profile). "+N Others" has no action (no list designed). Row spreads across the column; on phones it
 * scrolls sideways when it doesn't fit.
 */
import type { EventMember } from '~/types/event'

const props = defineProps<{ members: EventMember[]; count: number }>()
const emit = defineEmits<{ view: [] }>()

const others = computed(() => Math.max(0, props.count - props.members.length))
</script>

<template>
  <section class="event-community" aria-labelledby="event-community-title">
    <div class="event-community__head">
      <h2 id="event-community-title" class="event-title text-detail-section-title">
        Community <span class="event-community__count">({{ count.toLocaleString('en-GB') }})</span>
      </h2>
      <button type="button" class="event-community__invite text-small-semibold" aria-haspopup="dialog" @click="emit('view')">View all</button>
    </div>

    <ul class="event-community__row">
      <li v-for="m in members" :key="m.person.id" class="event-community__person">
        <span class="event-community__who" :aria-label="`${m.person.name}${m.isHost ? ', host' : ''}`" role="group">
          <span class="event-community__avatar">
            <UiAvatar :name="m.person.name" :seed="m.person.username" :src="m.person.avatarUrl" :size="48" />
            <span v-if="m.gender" :class="['event-community__gender', `event-community__gender--${m.gender}`]" aria-hidden="true">{{ m.gender === 'female' ? 'F' : 'M' }}</span>
          </span>
          <span class="event-community__badge-slot">
            <span v-if="m.isHost" class="event-community__host text-sub-regular">Host</span>
          </span>
          <span class="event-community__name">{{ m.person.name }}</span>
        </span>
      </li>
      <li v-if="others" class="event-community__person">
        <button type="button" class="event-community__who event-community__who--more" aria-haspopup="dialog" @click="emit('view')">
          <span class="event-community__more">+{{ others > 99 ? '99' : others }}</span>
          <span class="event-community__badge-slot" />
          <span class="event-community__name">Others<span class="visually-hidden"> ({{ others }} more people, view all)</span></span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.event-community { display: flex; flex-direction: column; gap: var(--spacing-section); }
.event-community__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--spacing-md); }
.event-community__count {
  font-weight: var(--font-weight-regular);
  letter-spacing: -0.2px;
  color: var(--color-text-secondary);
}
.event-community__invite {
  flex: none;
  padding: var(--spacing-xs);
  margin: calc(-1 * var(--spacing-xs)) calc(-1 * var(--spacing-xs)) 0 0;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-action-primary);
  cursor: pointer;
}
.event-community__invite:hover { background: var(--color-background-secondary); } /* proposed */
.event-community__who--more { cursor: pointer; border-radius: var(--radius-md); }
.event-community__who--more:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.event-community__who--more:hover .event-community__more { background: var(--color-border-default); } /* proposed */

.event-community__row {
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 0;
  list-style: none;
}
.event-community__person { position: relative; flex: none; width: 80px; } /* keeps the hidden label inside the row */
.event-community__who {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xxs);
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
}
.event-community__avatar { position: relative; display: inline-flex; margin-bottom: -16px; }
/* Host pill slot: 18px tall, overlaps the photo by 16px (Figma) */
.event-community__badge-slot { position: relative; display: flex; justify-content: center; height: 18px; }
.event-community__host {
  height: 16px;
  padding: 0 var(--spacing-xxs);
  border: var(--border-width-emphasis) solid var(--color-background-primary);
  border-radius: var(--radius-pill);
  background: var(--color-host-badge);
  color: var(--color-text-inverse);
  line-height: 12px;
}
.event-community__gender {
  position: absolute;
  top: 1px;
  left: 34px; /* top right of the photo; 18 with the 2px white edge so F / M read clearly (decision 27 Oct; was 12 with a 6px letter) */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: var(--border-width-emphasis) solid var(--color-background-primary);
  border-radius: var(--radius-pill);
  box-sizing: border-box;
  color: var(--color-text-inverse);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  overflow: hidden;
}
.event-community__gender--female { background: var(--color-gender-female); }
.event-community__gender--male { background: var(--color-gender-male); }
.event-community__name {
  width: 100%;
  overflow: hidden;
  color: var(--color-text-field);
  font-size: var(--text-member-name-size);
  line-height: var(--text-member-name-line);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.event-community__more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: -16px;
  border: var(--border-width-emphasis) solid var(--color-background-primary);
  border-radius: var(--radius-full);
  box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.08);
  background: var(--color-avatar-more);
  color: var(--color-avatar-more-text);
  font-weight: var(--text-member-more-weight);
  font-size: var(--text-member-more-size);
  line-height: var(--text-member-more-line);
  box-sizing: border-box;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 767px) {
  .event-community__row {
    justify-content: flex-start;
    margin-inline: calc(-1 * var(--container-inset-mobile));
    padding-inline: var(--container-inset-mobile);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .event-community__row::-webkit-scrollbar { display: none; }
}
.event-title { margin: 0; color: var(--color-text-primary); }
</style>
