import type { PayloadRequest } from 'payload'

export function isServiceRole(req: PayloadRequest): boolean {
  const apiKey = process.env.PAYLOAD_API_KEY

  if (!apiKey) {
    return false
  }

  const authHeader = req.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }

  return authHeader.slice('Bearer '.length) === apiKey
}
