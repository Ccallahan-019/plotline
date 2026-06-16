import { verifyWebhook } from '@clerk/backend/webhooks'

import { ClerkUserPayload } from './types'
import { upsertProfile } from './upsertProfile'

export async function POST(request: Request): Promise<Response> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return Response.json({ error: 'CLERK_WEBHOOK_SECRET is not configured' }, { status: 500 })
  }

  let event

  try {
    event = await verifyWebhook(request, {
      signingSecret: webhookSecret,
    })
  } catch {
    return Response.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  if (event.type !== 'user.created' && event.type !== 'user.updated') {
    return Response.json({ ok: true, skipped: event.type })
  }

  const user = event.data as ClerkUserPayload

  if (!user?.id) {
    return Response.json({ error: 'Missing user id in webhook payload' }, { status: 400 })
  }

  let profile

  try {
    profile = await upsertProfile(user)
  } catch (error) {
    console.error('Clerk webhook profile upsert failed:', error)

    return Response.json({ error: 'Failed to sync profile' }, { status: 500 })
  }

  return Response.json({
    ok: true,
    profileId: profile.id,
  })
}
