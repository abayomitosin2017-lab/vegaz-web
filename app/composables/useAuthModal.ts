/**
 * Opens and closes the onboarding modal from anywhere (header buttons, etc.).
 * Shared state via Nuxt useState so every component sees the same value.
 * `open({ reason: 'expired', email })`: the "You've been signed out" log-in
 * (session expired, decision 27 Oct), email filled in.
 */
export type AuthReason = 'expired' | null

export function useAuthModal() {
  const isOpen = useState('auth-modal-open', () => false)
  const reason = useState<AuthReason>('auth-modal-reason', () => null)
  const email = useState('auth-modal-email', () => '')
  return {
    isOpen,
    reason,
    email,
    open: (opts?: { reason?: AuthReason; email?: string }) => {
      reason.value = opts?.reason ?? null
      email.value = opts?.email ?? ''
      isOpen.value = true
    },
    close: () => { isOpen.value = false; reason.value = null; email.value = '' },
  }
}
