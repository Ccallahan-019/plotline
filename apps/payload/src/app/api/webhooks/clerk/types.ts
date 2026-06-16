export type ClerkUserPayload = {
  first_name?: null | string
  id: string
  image_url?: null | string
  last_name?: null | string
  username?: null | string
}

export type ProfileWriteInput =
  | {
      data: {
        avatarUrl?: string
        clerkUserId: string
        displayName: string
        username: string
      }
      id: number
      operation: 'update'
    }
  | {
      data: {
        avatarUrl?: string
        clerkUserId: string
        displayName: string
        username: string
      }
      operation: 'create'
    }
