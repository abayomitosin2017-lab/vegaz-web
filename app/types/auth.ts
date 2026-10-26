/** Onboarding / auth types. Field names are a proposal for the API contract. */
export type AuthFlow = 'signup' | 'login'
export type Gender = 'female' | 'male'

export interface SignupProfile {
  email: string
  firstName: string
  lastName: string
  username: string
  /** Optional in Figma (Continue is active with it empty) */
  phone?: string
  gender: Gender
}

/** The signed-in user, as shown in the header. Field names are a proposal. */
export interface SessionUser {
  firstName: string
  lastName: string
  username: string
  /** Profile photo URL. Missing -> letter avatar (onboarding has no photo step) */
  avatarUrl?: string
  /** Contact details, used to fill in the buy ticket flow (decision 22 Oct) */
  email?: string
  phone?: string
  /** From onboarding or Edit Profile / the gender prompt */
  gender?: Gender
  /** "YYYY-MM-DD"; set in Edit Profile or the birthday prompt */
  birthday?: string
  /** Edit Profile "Bio" (up to 100 words) */
  bio?: string
  /** Edit Profile photos, up to 3; the first is the profile photo (avatarUrl) */
  photos?: string[]
}
