import type { Config } from '@plotline/payload-types'

declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}

export type * from '@plotline/payload-types'
