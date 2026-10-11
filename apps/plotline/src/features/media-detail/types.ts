import type { LibraryItem, Media, WatchEvent } from '@plotline/payload-types'

export type MediaTitleCastMember = {
  character: null | string
  id: number
  initials: string
  name: string
  profilePath: null | string
}

export type MediaTitleCreditCard = {
  id: number
  initials: string
  name: string
  profilePath: null | string
  subtitle: null | string
}

export type MediaTitleCrewMember = {
  id: number
  initials: string
  jobs: null | string
  name: string
  profilePath: null | string
}

export type MediaTitleKeyCreditGroup = {
  label: string
  names: string[]
}

export type MediaTitlePageData = {
  cast: MediaTitleCastMember[]
  certification: null | string
  createdBy: string[]
  crew: MediaTitleCrewMember[]
  directors: string[]
  keyCredits: MediaTitleKeyCreditGroup[]
  language: null | string
  libraryItem: LibraryItem | null
  media: Media
  networks: string[]
  region: string
  releaseStatusLabel: null | string
  seasons: MediaTitleSeason[]
  voteAverage: null | number
  voteCount: null | number
  watchEvents: MediaTitleWatchEvent[]
}

export type MediaTitleSeason = {
  airDate: null | string
  episodeCount: null | number
  name: string
  posterPath: null | string
  seasonNumber: number
}

export type MediaTitleWatchEvent = {
  episode: null | number
  eventType: WatchEvent['eventType']
  id: number
  platform: NonNullable<WatchEvent['platform']> | null
  platformOther: null | string
  runtimeMinutes: null | number
  season: null | number
  watchedAt: string
}

export type TmdbCommunityReview = {
  avatarUrl: null | string
  body: string
  id: string
  initials: string
  name: string
  rating: null | number
  writtenAt: string
}

export type TmdbCommunityReviewPage = {
  page: number
  reviews: TmdbCommunityReview[]
  totalPages: number
  totalResults: number
}
