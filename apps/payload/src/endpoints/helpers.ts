import type { PayloadRequest } from 'payload'

import { isServiceRole } from '../access/isServiceRole'
import { resolveProfileFromRequest } from '../access/resolveProfileFromRequest'

export function parseId(value: number | string | undefined): null | number {
  if (value === undefined) {
    return null
  }

  const parsed = typeof value === 'number' ? value : Number(value)

  return Number.isNaN(parsed) ? null : parsed
}

export async function parseJsonBody<T>(req: PayloadRequest): Promise<Response | T> {
  if (typeof req.json !== 'function') {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    return (await req.json()) as T
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}

/**
 * Reads the `:id` route param of a `/library/library-items/:id` route.
 *
 * @param req - Payload request carrying `routeParams`
 * @returns A positive integer id, or `null` when `0`, negative, fractional or non-numeric
 */
export function readLibraryItemRouteId(req: PayloadRequest): null | number {
  const parsed = parseId(req.routeParams?.id as number | string | undefined)

  if (parsed == null || !Number.isInteger(parsed) || parsed < 1) {
    return null
  }

  return parsed
}

export async function requireProfileContext(
  req: PayloadRequest,
): Promise<{ profileId: number } | Response> {
  const profileId = await resolveProfileFromRequest(req)

  if (profileId == null) {
    return Response.json({ error: 'Profile not found for clerk user' }, { status: 404 })
  }

  return { profileId }
}

export async function requireServiceAuth(req: PayloadRequest): Promise<null | Response> {
  if (!isServiceRole(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
