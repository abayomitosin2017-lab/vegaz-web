/**
 * Development only (never in a build): lets testers trigger states that the
 * mock data can't produce on its own. In the browser console:
 *   __vegaz.expireSession()   -> "You've been signed out" log-in
 *   __vegaz.pwaNudge()        -> "Install Vegaz" banner (phones; iPhone Safari or with an install prompt)
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.dev) return
  const session = useSession()
  const pwa = usePwaInstall()
  ;(window as unknown as { __vegaz: Record<string, () => void> }).__vegaz = {
    expireSession: () => session.expire(),
    pwaNudge: () => pwa.nudge(),
  }
})
