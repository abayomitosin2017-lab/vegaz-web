import type { Gender } from '~/types/auth'
import type { ChatPerson } from '~/types/chat'
import { placeholderPhoto } from './placeholders'

/**
 * Demo people shared by chats and event communities, so the same person looks
 * the same everywhere. Names are invented. Some have no photo on purpose, to
 * show the letter avatar (as Figma does in the Community row).
 * Mock data only: components never import this file.
 */
export interface MockPerson extends ChatPerson {
  gender: Gender
}

const p = (id: string, name: string, username: string, gender: Gender, photo?: number): MockPerson =>
  ({ id: `u-${id}`, name, username, gender, avatarUrl: photo ? placeholderPhoto(photo) : undefined })

export const people = {
  oreban: p('oreban', 'Oreban Jude', 'orebanjude', 'male', 18),
  janet: p('janet', 'Janet Meya', 'janetmeya', 'female', 19),
  john: p('john', 'John Bosco', 'johnbosco', 'male', 9),
  tobi: p('tobi', 'Tobi Adeyemi', 'tobi', 'male', 4),
  vivian: p('vivian', 'Vivian Okafor', 'vivian', 'female', 15),
  ada: p('ada', 'Ada Nwosu', 'ada', 'female', 7),
  sandra: p('sandra', 'Sandra Bello', 'sandra', 'female', 8),
  sam: p('sam', 'Sam Eze', 'sam', 'male', 12),
  dayo: p('dayo', 'Dayo Coker', 'dayocoker', 'male', 22),
  ifeoma: p('ifeoma', 'Ifeoma Obi', 'ifeoma', 'female', 11),
  chidi: p('chidi', 'Chidi Nnaji', 'chidin', 'male', 17),
  femi: p('femi', 'Femi Lawal', 'femilawal', 'male', 20),
  bisi: p('bisi', 'Bisi Alade', 'bisialade', 'female', 1),
  uche: p('uche', 'Uche Kalu', 'uchekalu', 'male', 13),
  kemi: p('kemi', 'Kemi Ojo', 'kemiojo', 'female'),
  bayo: p('bayo', 'Bayo Martins', 'bayom', 'male'),
  amaka: p('amaka', 'Amaka Eze', 'amakaeze', 'female'),
  segun: p('segun', 'Segun Ade', 'segunade', 'male'),
} satisfies Record<string, MockPerson>

export type PersonKey = keyof typeof people

/** Gender for any demo person (used by the profile panel memoji) */
export function genderOf(personId: string): Gender | undefined {
  return Object.values(people).find(x => x.id === personId)?.gender
}
