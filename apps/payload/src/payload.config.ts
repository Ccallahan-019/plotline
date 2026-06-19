import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { LibraryItems } from './collections/library-items'
import { Media } from './collections/media'
import { Profiles } from './collections/profiles'
import { Reviews } from './collections/reviews'
import { Users } from './collections/users'
import { WatchEvents } from './collections/watch-events'
import { WatchlistMemberships } from './collections/watchlist-memberships'
import { Watchlists } from './collections/watchlists'
import {
  addToListEndpoint,
  logWatchEndpoint,
  recalculateWatchlistStatsEndpoint,
  tmdbUpsertEndpoint,
} from './endpoints'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const plotlineUrl = process.env.PLOTLINE_URL ?? 'http://localhost:3000'

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
  },
  collections: [
    Users,
    Profiles,
    Media,
    LibraryItems,
    Watchlists,
    WatchlistMemberships,
    WatchEvents,
    Reviews,
  ],
  cors: {
    headers: ['Authorization', 'Content-Type', 'x-clerk-user-id'],
    origins: [plotlineUrl],
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL ?? '',
    },
  }),
  editor: lexicalEditor(),
  endpoints: [
    tmdbUpsertEndpoint,
    addToListEndpoint,
    logWatchEndpoint,
    recalculateWatchlistStatsEndpoint,
  ],
  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    declare: false,
    outputFile: path.resolve(dirname, '../../../packages/payload-types/src/index.ts'),
  },
})
