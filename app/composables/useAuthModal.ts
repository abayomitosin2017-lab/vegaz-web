/**
 * Opens and closes the onboarding modal from anywhere (header buttons, etc.).
 * Shared state via Nuxt useState so every component sees the same value.
 */
export function useAuthModal() {
  const isOpen = useState('auth-modal-open', () => false)
  return {
    isOpen,
    open: () => { isOpen.value = true },
    close: () => { isOpen.value = false },
  }
}
