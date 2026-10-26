import type { Gender } from '~/types/auth'
import { saveBirthday, saveGender } from '~/services/profile'

/**
 * Birthday and gender prompts (Figma "birthday" / "gender" frames, over
 * Home). Decision 26 Oct: after a login, if the profile has no birthday (or
 * no gender), the prompt opens on Home; birthday first, then gender.
 * Closing one skips the rest until the next login.
 * They don't open when the login was for something else (hosting, buying
 * a ticket, joining a chat) or happened on another page, so they never
 * interrupt that flow.
 * The default layout calls this once.
 */
export function useProfilePrompts() {
  const { user, setUser } = useSession()
  const auth = useAuthModal()
  const route = useRoute()
  const hostPending = useState('host-after-login', () => false)
  const prompt = useState<'birthday' | 'gender' | null>('profile-prompt', () => null)
  const busy = ref(false)
  let pending = false

  function next() {
    const u = user.value
    if (!u) { prompt.value = null; return }
    prompt.value = !u.birthday ? 'birthday' : !u.gender ? 'gender' : null
  }

  watch(user, (u, before) => {
    if (u && !before) pending = !hostPending.value && route.path === '/'
    if (!u) { pending = false; prompt.value = null }
  })
  watch([user, auth.isOpen], ([u, open]) => {
    if (!pending || !u || open) return
    pending = false
    // let any navigation from the login settle first
    setTimeout(() => { if (route.path === '/' && !auth.isOpen.value) next() }, 400)
  })

  async function onBirthday(birthday: string) {
    if (!user.value || busy.value) return
    busy.value = true
    try {
      setUser(await saveBirthday(user.value, birthday))
      prompt.value = user.value?.gender ? null : 'gender'
    } finally { busy.value = false }
  }
  async function onGender(gender: Gender) {
    if (!user.value || busy.value) return
    busy.value = true
    try {
      setUser(await saveGender(user.value, gender))
      prompt.value = null
    } finally { busy.value = false }
  }
  const close = () => { prompt.value = null }

  return { prompt, busy, onBirthday, onGender, close }
}
