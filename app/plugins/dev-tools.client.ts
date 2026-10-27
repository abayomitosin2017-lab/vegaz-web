/**
 * Development only (never in a build): lets testers trigger states that the
 * mock data can't produce on its own. In the browser console:
 *   __vegaz.expireSession()   -> "You've been signed out" log-in
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.dev) return
  const session = useSession()
  ;(window as unknown as { __vegaz: Record<string, () => void> }).__vegaz = {
    expireSession: () => session.expire(),
  }
})
