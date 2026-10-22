import type { SessionUser } from '~/types/auth'
import { signOut } from '~/services/auth'

/**
 * The signed-in user, shared across the app (Nuxt useState).
 * null = signed out. MOCK: kept in memory only, so a page reload signs you
 * out. OPEN ITEM (engineering): real session (cookie/token) and restoring it
 * on load.
 */
export function useSession() {
  const user = useState<SessionUser | null>('session-user', () => null)
  return {
    user,
    setUser: (value: SessionUser) => { user.value = value },
    logout: async () => {
      await signOut()
      user.value = null
    },
  }
}
