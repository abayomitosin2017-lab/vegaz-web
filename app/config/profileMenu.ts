import type { DropdownItem } from '~/components/ui/DropdownMenu.vue'

/**
 * Profile menu items, in Figma order (node 10653:40453).
 * Chat opens /chat; Log out signs out.
 * OPEN ITEM: Edit Profile, Settings and My Activities have no pages yet;
 * choosing them only closes the menu.
 */
export const profileMenuItems: DropdownItem[] = [
  { id: 'edit-profile', label: 'Edit Profile' },
  { id: 'chat', label: 'Chat' },
  { id: 'settings', label: 'Settings' },
  { id: 'activities', label: 'My Activities' },
  { id: 'logout', label: 'Log out', tone: 'danger', separated: true },
]
