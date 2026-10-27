/**
 * Photo upload rules, checked before anything is added
 * (decision 27 Oct; PROPOSED limits, engineering to confirm with storage):
 * - photos only: JPG, PNG, WebP, HEIC / HEIF (GIF allowed in chat);
 * - 10 MB or less each;
 * - no more than the place allows (chat 10 per message, event 5, profile 3).
 * Returns the files that can be added and one short message about any that
 * can't (or '' when everything is fine).
 */
export const PHOTO_MAX_MB = 10
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif']

export function checkPhotos(files: File[], room: number, limit: number): { ok: File[]; problem: string } {
  const notPhoto = files.filter(f => !TYPES.includes(f.type) && !/\.(jpe?g|png|webp|heic|heif|gif)$/i.test(f.name))
  const photos = files.filter(f => !notPhoto.includes(f))
  const tooBig = photos.filter(f => f.size > PHOTO_MAX_MB * 1024 * 1024)
  const fine = photos.filter(f => !tooBig.includes(f))
  const ok = fine.slice(0, Math.max(0, room))
  const over = fine.length - ok.length

  const name = (list: File[]) => (list.length === 1 ? `“${list[0]!.name}”` : `${list.length} files`)
  let problem = ''
  if (notPhoto.length) problem = `${name(notPhoto)} ${notPhoto.length === 1 ? 'isn’t a photo' : 'aren’t photos'}. Use JPG, PNG, WebP or HEIC.`
  else if (tooBig.length) problem = `${name(tooBig)} ${tooBig.length === 1 ? 'is' : 'are'} over ${PHOTO_MAX_MB} MB. Choose a smaller photo.`
  else if (over > 0) problem = room > 0 ? `You can add up to ${limit} photos. We added the first ${ok.length}.` : `You can add up to ${limit} photos.`
  return { ok, problem }
}
