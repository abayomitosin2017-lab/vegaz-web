<script setup lang="ts">
import '~/components/profile/styles.css'
import type { Gender } from '~/types/auth'
import { BIO_MAX_WORDS, countWords, profileCompletion, saveProfile } from '~/services/profile'
/**
 * Edit Profile (profile menu "Edit Profile").
 *
 * Web (Figma web section 10838:19056): site header and footer; content
 * 64 below the header, 150 from the sides (1140 wide at 1440), 40 between
 * parts. Back circle + "Edit Profile" (Headline 1 bold, 16 apart). Two
 * columns 64 apart: left 360 wide (progress, photos, photo tip, 24 apart);
 * right: "Personal Info", fields in two columns (24 apart), a line, "Bio",
 * and "Save Changes" (240) on the right.
 * Phones (Figma mobile 10834:28185 / 28268): no site header or footer;
 * back circle + centred "Edit Profile"; one column 341 wide, 24 between
 * parts; "Save Changes" in a white bar fixed at the bottom (1px line on
 * top, 20 padding).
 *
 * Rules (decision 26 Oct): every field can be changed except Email, which
 * is shown locked. First name, last name and username are required.
 * "Profile N% Complete" counts 8 items equally (see services/profile.ts).
 * "Save Changes" turns Primary once something changed and the form is
 * valid; saving updates the signed-in user (MOCK, memory only).
 * Field placeholders follow the field (Figma repeats "info@stencilui.com").
 */
definePageMeta({ requiresAuth: true, footer: 'desktop' })
useHead({ title: 'Edit Profile · Vegaz' })

const { user, setUser } = useSession()
const auth = useAuthModal()
const router = useRouter()
const isPhone = usePhoneLayout()
const hideHeaderOnPhone = useState('hide-header-phone', () => false)
onMounted(() => {
  hideHeaderOnPhone.value = true
  if (!user.value) { navigateTo('/'); auth.open() }
})
onBeforeUnmount(() => { hideHeaderOnPhone.value = false })

interface Form { firstName: string; lastName: string; username: string; gender: Gender | ''; birthday?: string; bio: string; photos: string[] }
const fromUser = (): Form => ({
  firstName: user.value?.firstName ?? '',
  lastName: user.value?.lastName ?? '',
  username: user.value?.username ?? '',
  gender: user.value?.gender ?? '',
  birthday: user.value?.birthday,
  bio: user.value?.bio ?? '',
  photos: user.value?.photos ?? (user.value?.avatarUrl ? [user.value.avatarUrl] : []),
})
const form = reactive<Form>(fromUser())
const saved = ref(JSON.stringify(fromUser()))
watch(user, u => { if (u && JSON.stringify(form) === saved.value) { Object.assign(form, fromUser()); saved.value = JSON.stringify(fromUser()) } })

const id = useId()
const usernameError = ref('')
const busy = ref(false)
const toast = ref('')

const words = computed(() => countWords(form.bio))
function onBio(e: Event) {
  const el = e.target as HTMLTextAreaElement
  // stop at 100 words (the counter's limit)
  if (countWords(el.value) > BIO_MAX_WORDS) {
    const m = el.value.match(new RegExp(`^\\s*(?:\\S+\\s+){${BIO_MAX_WORDS - 1}}\\S+`))
    el.value = m ? m[0] : el.value
  }
  form.bio = el.value
}
const percent = computed(() => profileCompletion({ ...form, gender: form.gender || undefined, email: user.value?.email }))
const changed = computed(() => JSON.stringify(form) !== saved.value)
const valid = computed(() => !!form.firstName.trim() && !!form.lastName.trim() && !!form.username.trim())
const ready = computed(() => changed.value && valid.value && !busy.value)
watch(() => form.username, () => { usernameError.value = '' })

async function save() {
  if (!ready.value || !user.value) return
  busy.value = true
  try {
    const res = await saveProfile(user.value, { ...form, gender: form.gender || undefined, photos: [...form.photos] })
    if (!res.ok) { usernameError.value = res.message; return }
    setUser(res.user)
    Object.assign(form, fromUser())
    saved.value = JSON.stringify(fromUser())
    toast.value = 'Changes saved'
  } finally { busy.value = false }
}
function back() {
  if (window.history.length > 1) router.back()
  else navigateTo('/')
}
</script>

<template>
  <div v-if="user" class="profile-edit">
    <form class="profile-edit__inner" novalidate @submit.prevent="save">
      <div v-if="isPhone" class="profile-mbar">
        <UiBackButton class="profile-back" @click="back" />
        <h1 class="profile-mbar__title text-app-body-semibold">Edit Profile</h1>
      </div>
      <div v-else class="profile-edit__title-row">
        <UiBackButton class="profile-back" @click="back" />
        <h1 class="profile-edit__title text-app-h1-bold">Edit Profile</h1>
      </div>

      <div class="profile-edit__cols">
        <div class="profile-edit__left">
          <div class="profile-edit__progress">
            <hr class="profile-rule" />
            <div class="profile-edit__progress-row">
              <p class="profile-edit__progress-text text-app-small-regular">Profile {{ percent }}% Complete</p>
              <span class="profile-edit__bar" role="progressbar" aria-label="Profile complete" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
                <span class="profile-edit__needle" :style="{ width: `${percent}%` }" />
              </span>
            </div>
            <hr class="profile-rule" />
          </div>
          <ProfilePhotoTiles v-model="form.photos" />
          <p class="profile-edit__tip text-app-small-regular">
            <img v-if="!form.photos.length" src="/images/profile/icon-info-24.svg" alt="" width="24" height="24" />
            <span>Tap a photo to replace it, your first photo is your main profile photo</span>
          </p>
        </div>

        <div class="profile-edit__right">
          <hr class="profile-rule profile-edit__phone-rule" />
          <h2 class="profile-heading">Personal Info</h2>
          <div class="profile-edit__fields">
            <div class="profile-field">
              <label :for="`${id}-fn`" class="profile-field__label text-app-small-regular">First Name</label>
              <input :id="`${id}-fn`" v-model="form.firstName" class="profile-input" type="text" autocomplete="given-name" maxlength="40" placeholder="Enter your first name" :aria-invalid="!form.firstName.trim() ? 'true' : undefined" />
            </div>
            <div class="profile-field">
              <label :for="`${id}-ln`" class="profile-field__label text-app-small-regular">Last Name</label>
              <input :id="`${id}-ln`" v-model="form.lastName" class="profile-input" type="text" autocomplete="family-name" maxlength="40" placeholder="Enter your last name" :aria-invalid="!form.lastName.trim() ? 'true' : undefined" />
            </div>
            <div class="profile-field">
              <label :for="`${id}-un`" class="profile-field__label text-app-small-regular">Username</label>
              <input :id="`${id}-un`" v-model="form.username" class="profile-input" type="text" autocomplete="username" maxlength="30" placeholder="Choose a username" :aria-invalid="usernameError || !form.username.trim() ? 'true' : undefined" :aria-describedby="usernameError ? `${id}-ue` : undefined" />
              <p v-if="usernameError" :id="`${id}-ue`" class="profile-field__error text-app-small-regular" role="alert">{{ usernameError }}</p>
            </div>
            <div class="profile-field">
              <label :for="`${id}-em`" class="profile-field__label text-app-small-regular">Email Address</label>
              <input :id="`${id}-em`" class="profile-input" type="email" :value="user.email ?? ''" readonly aria-readonly="true" placeholder="No email address" />
            </div>
            <div class="profile-field">
              <label :for="`${id}-gd`" class="profile-field__label text-app-small-regular">Gender</label>
              <span class="profile-edit__select">
                <select :id="`${id}-gd`" v-model="form.gender" :class="['profile-input profile-edit__select-input', { 'profile-edit__select-input--empty': !form.gender }]">
                  <option value="" disabled hidden>Select Gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
                <img src="/images/profile/icon-select-chevron-12.svg" alt="" width="12" height="7" />
              </span>
            </div>
            <div class="profile-field">
              <span :id="`${id}-bl`" class="profile-field__label text-app-small-regular">Birthday</span>
              <ProfileBirthdayField :id="`${id}-bd`" v-model="form.birthday" :labelledby="`${id}-bl`" />
            </div>
          </div>
          <hr class="profile-rule" />
          <div class="profile-edit__bio">
            <h2 class="profile-heading"><label :for="`${id}-bio`">Bio</label></h2>
            <div class="profile-edit__textarea">
              <textarea :id="`${id}-bio`" :value="form.bio" class="profile-input profile-edit__bio-input" placeholder="Tell people about yourself" :aria-describedby="`${id}-wc`" @input="onBio" />
              <span :id="`${id}-wc`" class="profile-edit__count text-app-small-regular">{{ words }}/{{ BIO_MAX_WORDS }} words</span>
            </div>
          </div>
          <div v-if="!isPhone" class="profile-edit__actions">
            <UiButton type="submit" :class="['profile-edit__save', { 'profile-inactive': !ready }]" :color="ready ? 'primary' : 'secondary'" :aria-disabled="!ready ? 'true' : undefined">{{ busy ? 'Saving…' : 'Save Changes' }}</UiButton>
          </div>
        </div>
      </div>

      <div v-if="isPhone" class="profile-edit__bar-bottom">
        <UiButton type="submit" :class="['profile-edit__save', { 'profile-inactive': !ready }]" :color="ready ? 'primary' : 'secondary'" :aria-disabled="!ready ? 'true' : undefined">{{ busy ? 'Saving…' : 'Save Changes' }}</UiButton>
      </div>
    </form>
    <UiToast :message="toast" @done="toast = ''" />
  </div>
</template>

<style scoped>
.profile-edit { background: var(--color-background-primary); }
.profile-edit__inner {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
  width: min(1140px, 100% - 2 * var(--container-inset-mobile));
  margin: 0 auto;
  padding: var(--spacing-page-top) 0 120px;
}
.profile-edit__title-row { display: flex; align-items: center; gap: var(--spacing-md); }
.profile-edit__title { margin: 0; color: var(--color-text-checkout); }
.profile-edit__cols { display: flex; align-items: flex-start; gap: var(--spacing-4xl); }
.profile-edit__left { flex: none; width: 360px; display: flex; flex-direction: column; gap: var(--spacing-lg); }
.profile-edit__right { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: var(--spacing-lg); }
.profile-edit__phone-rule { display: none; }

.profile-edit__progress { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.profile-edit__progress-row { display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-xxs) 0; }
.profile-edit__progress-text { margin: 0; color: var(--color-text-strong); }
.profile-edit__bar { position: relative; width: 64px; height: 8px; overflow: hidden; border-radius: 16px; background: var(--color-border-default); }
.profile-edit__needle { position: absolute; inset: 0 auto 0 0; border-radius: var(--radius-sm); background: var(--color-action-primary); transition: width 200ms ease; }

.profile-edit__tip { display: flex; align-items: center; gap: var(--spacing-md); margin: 0; padding: var(--spacing-xxs) var(--spacing-xs); border-radius: 16px; background: var(--color-background-secondary); color: var(--color-text-strong); }
.profile-edit__tip img { flex: none; }

.profile-edit__fields { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); }

.profile-edit__select { position: relative; display: block; }
.profile-edit__select-input { appearance: none; -webkit-appearance: none; padding-right: 40px; cursor: pointer; }
.profile-edit__select-input--empty { color: var(--color-text-placeholder); }
.profile-edit__select-input option { color: var(--color-text-primary); }
.profile-edit__select img { position: absolute; right: var(--spacing-md); top: 50%; transform: translateY(-50%); pointer-events: none; }

.profile-edit__bio { display: flex; flex-direction: column; gap: var(--spacing-md); }
.profile-edit__textarea { position: relative; }
.profile-edit__bio-input { height: 120px; padding: var(--spacing-md) var(--spacing-md) 36px; resize: none; display: block; }
.profile-edit__count { position: absolute; right: var(--spacing-md); bottom: 12px; color: var(--color-text-muted); pointer-events: none; }

.profile-edit__actions { display: flex; justify-content: flex-end; }

/* 768-1023: narrower left column (not drawn) */
@media (max-width: 1023px) {
  .profile-edit__cols { gap: var(--spacing-xl); }
  .profile-edit__left { width: 300px; }
  .profile-edit__fields { grid-template-columns: 1fr; }
}

/* Phones: Figma mobile frame */
@media (max-width: 767px) {
  .profile-edit__inner {
    width: auto;
    gap: 34px;
    padding: calc(17px + env(safe-area-inset-top, 0px)) var(--container-inset-mobile) 120px; /* the layout adds room for the bottom navigation */
  }
  .profile-edit__cols { flex-direction: column; align-items: stretch; gap: var(--spacing-lg); }
  .profile-edit__left, .profile-edit__right { width: auto; gap: var(--spacing-lg); }
  .profile-edit__phone-rule { display: block; }
  .profile-edit__fields { gap: var(--spacing-md); }
  .profile-edit__bar-bottom {
    position: fixed;
    left: 0;
    right: 0;
    bottom: calc(var(--sizing-bottom-nav) + env(safe-area-inset-bottom, 0px)); /* sits on the bottom navigation (decision 26 Oct) */
    z-index: 5;
    padding: 20px;
    border-top: 1px solid rgba(225, 225, 225, 0.5); /* raw in Figma */
    background: var(--base-white);
  }
  .profile-edit__bar-bottom .profile-edit__save.ui-button { width: 100%; }
}
</style>
