/**
 * Entry to "Host an event" (header "Host an Event", Home "Add your event").
 * Signed in: opens the host flow (/host). Signed out: asks to log in first
 * (decision 23 Oct) and opens the flow right after a successful login;
 * closing the login without signing in cancels it.
 * The layout calls `watchLogin()` once so this works from any page.
 */
export function useHostEntry() {
  const { user } = useSession()
  const auth = useAuthModal()
  const pending = useState('host-after-login', () => false)

  function startHosting() {
    if (user.value) return navigateTo('/host')
    pending.value = true
    auth.open()
  }

  function watchLogin() {
    watch(user, u => {
      if (u && pending.value) {
        pending.value = false
        navigateTo('/host')
      }
    })
    watch(auth.isOpen, open => {
      if (!open && !user.value) pending.value = false
    })
  }

  return { startHosting, watchLogin }
}
