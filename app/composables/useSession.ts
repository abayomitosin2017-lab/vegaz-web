import type { SessionUser } from '~/types/auth'
import { signOut } from '~/services/auth'

/**
 * The signed-in user, shared across the app (Nuxt useState).
 * null = signed out. MOCK: kept in memory only, so a page reload signs you
 * out. OPEN ITEM (engineering): real session (cookie/token) and restoring it
 * on load.
 *
 * Session expired (decision 27 Oct; NOT IN FIGMA, PROPOSED): `expire()`
 * keeps the page exactly as it is (forms, cart, open chat) and opens the
 * log-in pop-up titled "You've been signed out", with their email filled in.
 * Logging in again carries on where they were. Closing it signs them out and
 * goes to Home. Engineering: call `expire()` when any request answers
 * 401 / "session expired".
 */
export function useSession() {
  const user = useState<SessionUser | null>('session-user', () => null)
  const expired = useState('session-expired', () => false)
  const auth = useAuthModal()
  return {
    user,
    expired,
    expire: () => {
      if (!user.value || expired.value) return
      expired.value = true
      auth.open({ reason: 'expired', email: user.value.email })
    },
    setUser: (value: SessionUser) => { user.value = value; expired.value = false },
    logout: async () => {
      try { await signOut() } catch { /* signed out on this device anyway */ }
      user.value = null
      expired.value = false
    },
  }
}
