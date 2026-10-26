import type { DropdownItem } from '~/components/ui/DropdownMenu.vue'

/**
 * Profile menu items, in Figma order (node 10653:40453).
 * Chat opens /chat; Log out signs out. Phones leave Chat out (it is in the
 * bottom navigation; decision 26 Oct).
 * Settings removed (decision 26 Oct): settings live in the Vegaz mobile app.
 * OPEN ITEM: Edit Profile and My Activities have no pages yet; choosing them
 * only closes the menu.
 */
export const profileMenuItems: DropdownItem[] = [
  { id: 'edit-profile', label: 'Edit Profile' },
  { id: 'chat', label: 'Chat' },
  { id: 'activities', label: 'My Activities' },
  { id: 'logout', label: 'Log out', tone: 'danger', separated: true },
]
