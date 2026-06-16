import type { PayloadRequest } from 'payload'

const PROFILE_ID_CONTEXT_KEY = 'profileId'

export async function resolveProfileFromRequest(
  req: PayloadRequest,
): Promise<null | number> {
  req.context ??= {}

  const existingProfileId = req.context[PROFILE_ID_CONTEXT_KEY]

  if (typeof existingProfileId === 'number') {
    return existingProfileId
  }

  if (typeof existingProfileId === 'string' && existingProfileId.length > 0) {
    const parsed = Number(existingProfileId)

    if (!Number.isNaN(parsed)) {
      req.context[PROFILE_ID_CONTEXT_KEY] = parsed

      return parsed
    }
  }

  const clerkUserId = req.headers.get('x-clerk-user-id')

  if (!clerkUserId) {
    return null
  }

  const result = await req.payload.find({
    collection: 'profiles',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      clerkUserId: {
        equals: clerkUserId,
      },
    },
  })

  const profile = result.docs[0]

  if (!profile) {
    return null
  }

  req.context[PROFILE_ID_CONTEXT_KEY] = profile.id

  return profile.id
}
