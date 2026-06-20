import type { Endpoint, PayloadRequest } from 'payload'

import {
  upsertMediaFromTmdb,
  type UpsertMediaFromTmdbInput,
} from '../utilities/upsertMediaFromTmdb'
import { parseJsonBody, requireServiceAuth } from './helpers'

export const tmdbUpsertEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    const unauthorized = await requireServiceAuth(req)

    if (unauthorized) {
      return unauthorized
    }

    const body = await parseJsonBody<UpsertMediaFromTmdbInput>(req)

    if (body instanceof Response) {
      return body
    }

    if (!body.tmdbId || !body.mediaType || !body.title) {
      return Response.json({ error: 'tmdbId, mediaType, and title are required' }, { status: 400 })
    }

    const doc = await upsertMediaFromTmdb(req, body)

    return Response.json({ doc })
  },
  method: 'post',
  path: '/tmdb/upsert',
}
