/**
 * Entry to "Host an event" (header "Host an Event", Home "Add your event").
 * Signed in: opens the host flow (/host). Signed out: asks to log in first
 * (decision 23 Oct) and opens the flow right after a successful login;
 * closing the login without signing in cancels it.
 * The layout calls `watchLogin()` once so this works from any page.
 * Phones (Figma mobile 10754:75731): the "Create event" choice opens as a
 * bottom sheet over the current page instead of the /host page.
 */
export function useHostEntry() {
  const { user } = useSession()
  const auth = useAuthModal()
  const pending = useState('host-after-login', () => false)
  const sheetOpen = useState('host-choice-sheet', () => false)
  const isPhone = () => import.meta.client && window.matchMedia('(max-width: 767px)').matches
  function openChoice() {
    if (isPhone()) { sheetOpen.value = true; return }
    return navigateTo('/host')
  }

  function startHosting() {
    if (user.value) return openChoice()
    pending.value = true
    auth.open()
  }

  function watchLogin() {
    watch(user, u => {
      if (u && pending.value) {
        pending.value = false
        openChoice()
      }
    })
    watch(auth.isOpen, open => {
      if (!open && !user.value) pending.value = false
    })
  }

  return { startHosting, watchLogin, sheetOpen }
}
