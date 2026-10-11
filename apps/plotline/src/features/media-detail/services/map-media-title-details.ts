import type { Media } from '@plotline/payload-types'
import type { TmdbMovieTitleDetails, TmdbTvTitleDetails } from '@plotline/shared/tmdb'

import type {
  MediaTitleCastMember,
  MediaTitleCrewMember,
  MediaTitleKeyCreditGroup,
  MediaTitleSeason,
} from '../types'

const MAX_DISPLAYED_CREDITS = 50

const FILM_KEY_CREDITS: readonly KeyCreditGroupDefinition[] = [
  { jobs: ['Director'], label: 'Directors' },
  { jobs: ['Screenplay', 'Story', 'Writer'], label: 'Writers' },
  { jobs: ['Director of Photography'], label: 'Cinematography' },
  { jobs: ['Editor'], label: 'Editors' },
]

const SERIES_KEY_CREDITS: readonly KeyCreditGroupDefinition[] = [
  { jobs: ['Executive Producer'], label: 'Executive producers' },
  { jobs: ['Original Music Composer'], label: 'Music' },
]

export type MappedMediaTitleDetails = {
  cast: MediaTitleCastMember[]
  certification: null | string
  createdBy: string[]
  crew: MediaTitleCrewMember[]
  directors: string[]
  keyCredits: MediaTitleKeyCreditGroup[]
  language: null | string
  networks: string[]
  releaseStatusLabel: null | string
  seasons: MediaTitleSeason[]
  voteAverage: null | number
  voteCount: null | number
}

type GroupedCredit = {
  detail: null | string
  id: number
  initials: string
  name: string
  profilePath: null | string
}

type KeyCreditGroupDefinition = {
  jobs: readonly string[]
  label: string
}

type RawCredit = {
  detail: null | string
  id: number
  name: string
  profilePath: null | string
}

type TmdbCastCredit = {
  character?: null | string
  id: number
  name: string
  profile_path?: null | string
}

type TmdbCrewCredit = {
  id: number
  job?: string
  name: string
  profile_path?: null | string
}

/**
 * English name for a TMDB original-language code.
 *
 * @param code - ISO 639-1 code such as `ja`, or empty when TMDB omitted it
 * @returns A display name, or `null` when the code is missing
 */
export function formatLanguageName(code: null | string | undefined): null | string {
  const trimmed = code?.trim()

  if (!trimmed) {
    return null
  }

  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(trimmed) ?? trimmed
  } catch {
    return trimmed
  }
}

/**
 * Maps a TMDB movie payload into the fields the title page does not store on `media`.
 *
 * Certification prefers the viewer's region, then the US listing, then any rated release.
 *
 * @param details - Movie details, including credits and release dates when TMDB sent them
 * @param region - Profile watch region, such as `US`
 * @returns Directors, certification, language, cast, and community vote fields
 */
export function mapMovieTitleDetails(
  details: TmdbMovieTitleDetails,
  region: string,
): MappedMediaTitleDetails {
  return {
    cast: mapCast(details.credits?.cast),
    certification: movieCertification(details, region),
    createdBy: [],
    crew: mapCrew(details.credits?.crew),
    directors: uniqueNames(
      (details.credits?.crew ?? [])
        .filter((member) => member.job === 'Director')
        .map((member) => member.name),
    ),
    keyCredits: mapKeyCreditGroups(FILM_KEY_CREDITS, details.credits?.crew),
    language: formatLanguageName(details.original_language),
    networks: [],
    releaseStatusLabel: details.status ?? null,
    seasons: [],
    voteAverage: details.vote_average ?? null,
    voteCount: details.vote_count ?? null,
  }
}

/**
 * Maps a TMDB series payload into the fields the title page does not store on `media`.
 *
 * Prefers `aggregate_credits`, which lists everyone who worked on the series.
 * `credits` is the shorter series-regulars list and is used when aggregate credits are absent.
 *
 * @param details - Series details, including creators, networks, seasons, and ratings
 * @param region - Profile watch region, such as `US`
 * @returns Creators, network, certification, seasons, cast, and community vote fields
 */
export function mapTvTitleDetails(
  details: TmdbTvTitleDetails,
  region: string,
): MappedMediaTitleDetails {
  const crewCredits = tvCrewCredits(details)

  return {
    cast: mapCast(tvCastCredits(details)),
    certification: tvCertification(details, region),
    createdBy: uniqueNames((details.created_by ?? []).map((person) => person.name)),
    crew: mapCrew(crewCredits),
    directors: [],
    keyCredits: mapTvKeyCredits(details, crewCredits),
    language: formatLanguageName(details.original_language),
    networks: uniqueNames((details.networks ?? []).map((network) => network.name)),
    releaseStatusLabel: details.status ?? null,
    seasons: mapSeasons(details.seasons),
    voteAverage: details.vote_average ?? null,
    voteCount: details.vote_count ?? null,
  }
}

/**
 * Season list for a cached series when TMDB details are unavailable.
 *
 * @param media - Stored catalog row
 * @returns One entry per stored season length. Names come from the season number; air dates are unknown.
 */
export function seasonsFromMedia(media: Media): MediaTitleSeason[] {
  return (media.tvMeta?.seasonEpisodeCounts ?? []).map((season) => ({
    airDate: null,
    episodeCount: season.episodeCount,
    name: seasonName(season.season, null),
    posterPath: null,
    seasonNumber: season.season,
  }))
}

// Theatrical release rating (type 3) when listed, otherwise the first rated release.
function firstCertification(
  releases: ReadonlyArray<{ certification?: string; type?: number }>,
): null | string {
  const theatrical = releases.find((release) => release.type === 3 && release.certification?.trim())
  const any = releases.find((release) => release.certification?.trim())
  const certification = (theatrical ?? any)?.certification?.trim()

  return certification || null
}

/**
 * Up to two letters for an avatar fallback: first and last name, or the first two of a single name.
 *
 * @param name - Person display name
 * @returns Uppercase initials, or an empty string when the name is blank
 */
function formatPersonInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
  const first = parts[0]
  const last = parts.at(-1)

  if (!first || !last) {
    return ''
  }

  if (parts.length === 1) {
    return first.slice(0, 2).toLocaleUpperCase()
  }

  return `${first.charAt(0)}${last.charAt(0)}`.toLocaleUpperCase()
}

/**
 * Billed cast, one card per person.
 *
 * @param cast - TMDB cast list, billed order
 * @returns At most 50 people. Repeat credits for the same id are merged.
 */
function mapCast(cast: readonly TmdbCastCredit[] | undefined): MediaTitleCastMember[] {
  return mapGroupedCredits(
    (cast ?? []).map((member) => ({
      detail: member.character?.trim() || null,
      id: member.id,
      name: member.name,
      profilePath: member.profile_path ?? null,
    })),
  ).map((person) => ({
    character: person.detail,
    id: person.id,
    initials: person.initials,
    name: person.name,
    profilePath: person.profilePath,
  }))
}

/**
 * Crew credits, one card per person. Distinct jobs are joined in first-seen order.
 *
 * @param crew - TMDB crew list
 * @returns At most 50 people
 */
function mapCrew(crew: readonly TmdbCrewCredit[] | undefined): MediaTitleCrewMember[] {
  return mapGroupedCredits(
    (crew ?? []).map((member) => ({
      detail: member.job?.trim() || null,
      id: member.id,
      name: member.name,
      profilePath: member.profile_path ?? null,
    })),
  ).map((person) => ({
    id: person.id,
    initials: person.initials,
    jobs: person.detail,
    name: person.name,
    profilePath: person.profilePath,
  }))
}

/**
 * Collapses credits to one entry per person, in first-seen order.
 *
 * A later credit for the same id appends a new detail and fills in a missing headshot.
 * Display keeps the first `MAX_DISPLAYED_CREDITS` people.
 *
 * @param credits - Cast or crew rows in TMDB order
 * @returns Grouped people, capped for the cast tab
 */
function mapGroupedCredits(credits: readonly RawCredit[]): GroupedCredit[] {
  const grouped = new Map<number, { details: string[]; name: string; profilePath: null | string }>()
  const order: number[] = []

  for (const credit of credits) {
    const existing = grouped.get(credit.id)

    if (!existing) {
      grouped.set(credit.id, {
        details: credit.detail ? [credit.detail] : [],
        name: credit.name,
        profilePath: credit.profilePath,
      })
      order.push(credit.id)
      continue
    }

    grouped.set(credit.id, {
      details:
        credit.detail && !existing.details.includes(credit.detail)
          ? [...existing.details, credit.detail]
          : existing.details,
      name: existing.name,
      profilePath: existing.profilePath ?? credit.profilePath,
    })
  }

  return order.slice(0, MAX_DISPLAYED_CREDITS).flatMap((id) => {
    const person = grouped.get(id)

    if (!person) {
      return []
    }

    return [
      {
        detail: person.details.join(', ') || null,
        id,
        initials: formatPersonInitials(person.name),
        name: person.name,
        profilePath: person.profilePath,
      },
    ]
  })
}

/**
 * Names for each highlighted credit group, in TMDB order.
 *
 * Matching is exact, so Assistant Director does not count as Director.
 * Groups with nobody are omitted. Selection uses the full crew list, including
 * people past the cast-tab display cap.
 *
 * @param groups - Role labels and the TMDB job names that belong in each
 * @param crew - Crew rows before the display cap
 * @returns Groups that have at least one person
 */
function mapKeyCreditGroups(
  groups: readonly KeyCreditGroupDefinition[],
  crew: readonly TmdbCrewCredit[] | undefined,
): MediaTitleKeyCreditGroup[] {
  return groups.flatMap((group) => {
    const names = uniqueNames(
      (crew ?? []).flatMap((member) =>
        member.job && group.jobs.includes(member.job) ? [member.name] : [],
      ),
    )

    if (names.length === 0) {
      return []
    }

    return [{ label: group.label, names }]
  })
}

/**
 * Season cards for the title page, ordered by season number.
 *
 * @param seasons - TMDB season summaries, including specials when present
 * @returns Seasons with a number, dropping entries TMDB left unnumbered
 */
function mapSeasons(seasons: TmdbTvTitleDetails['seasons']): MediaTitleSeason[] {
  if (!seasons) {
    return []
  }

  return seasons
    .flatMap((season) => {
      if (season.season_number == null) {
        return []
      }

      return [
        {
          airDate: season.air_date ?? null,
          episodeCount: season.episode_count ?? null,
          name: seasonName(season.season_number, season.name),
          posterPath: season.poster_path ?? null,
          seasonNumber: season.season_number,
        },
      ]
    })
    .sort((left, right) => left.seasonNumber - right.seasonNumber)
}

/**
 * Highlighted series credits: creators, executive producers, and composers.
 *
 * Creators come from `created_by`. The other groups come from the full crew list.
 *
 * @param details - Series details payload
 * @param crew - Expanded crew rows, including people past the display cap
 * @returns Groups that have at least one person
 */
function mapTvKeyCredits(
  details: TmdbTvTitleDetails,
  crew: readonly TmdbCrewCredit[] | undefined,
): MediaTitleKeyCreditGroup[] {
  const creators = uniqueNames((details.created_by ?? []).map((person) => person.name))

  return [
    ...(creators.length > 0 ? [{ label: 'Creators', names: creators }] : []),
    ...mapKeyCreditGroups(SERIES_KEY_CREDITS, crew),
  ]
}

// Film rating for the viewer's region, then the US, then any listed country.
function movieCertification(details: TmdbMovieTitleDetails, region: string): null | string {
  const results = details.release_dates?.results ?? []
  const preferred = preferredRegions(region)

  for (const code of preferred) {
    const country = results.find((entry) => entry.iso_3166_1 === code)
    const certification = firstCertification(country?.release_dates ?? [])

    if (certification) {
      return certification
    }
  }

  for (const country of results) {
    const certification = firstCertification(country.release_dates)

    if (certification) {
      return certification
    }
  }

  return null
}

// Region codes to try in order: the viewer's, then the US.
function preferredRegions(region: string): string[] {
  const normalized = region.trim().toUpperCase()
  return normalized === 'US' ? ['US'] : [normalized, 'US']
}

// TMDB's season name, or "Specials" / "Season N" when it is blank.
function seasonName(seasonNumber: number, name: null | string | undefined): string {
  const trimmed = name?.trim()

  if (trimmed) {
    return trimmed
  }

  return seasonNumber === 0 ? 'Specials' : `Season ${seasonNumber}`
}

/**
 * Series cast in billing order.
 *
 * Aggregate credits are one row per person, with a `roles` list. Those roles are
 * expanded so grouping can join the character names. The shorter `credits` cast
 * is used when TMDB did not send aggregate credits.
 *
 * @param details - Series details payload
 * @returns Cast rows for `mapCast`, or `undefined` when both lists are missing
 */
function tvCastCredits(details: TmdbTvTitleDetails): readonly TmdbCastCredit[] | undefined {
  const aggregate = details.aggregate_credits?.cast

  if (!aggregate?.length) {
    return details.credits?.cast
  }

  return [...aggregate]
    .sort(
      (left, right) =>
        (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER),
    )
    .flatMap((member): TmdbCastCredit[] => {
      const characters = (member.roles ?? []).flatMap((role) => {
        const character = role.character?.trim()

        return character ? [character] : []
      })

      if (characters.length === 0) {
        return [
          {
            character: null,
            id: member.id,
            name: member.name,
            profile_path: member.profile_path ?? null,
          },
        ]
      }

      return characters.map((character) => ({
        character,
        id: member.id,
        name: member.name,
        profile_path: member.profile_path ?? null,
      }))
    })
}

// Series content rating for the viewer's region, then the US, then any listed country.
function tvCertification(details: TmdbTvTitleDetails, region: string): null | string {
  const results = details.content_ratings?.results ?? []
  const preferred = preferredRegions(region)

  for (const code of preferred) {
    const match = results.find((entry) => entry.iso_3166_1 === code && entry.rating?.trim())

    if (match?.rating) {
      return match.rating.trim()
    }
  }

  const fallback = results.find((entry) => entry.rating?.trim())

  return fallback?.rating?.trim() ?? null
}

/**
 * Series crew, one row per job so grouping can join a person's jobs.
 *
 * @param details - Series details payload
 * @returns Crew rows for `mapCrew`, or `undefined` when both lists are missing
 */
function tvCrewCredits(details: TmdbTvTitleDetails): readonly TmdbCrewCredit[] | undefined {
  const aggregate = details.aggregate_credits?.crew

  if (!aggregate?.length) {
    return details.credits?.crew
  }

  return aggregate.flatMap((member) => {
    const jobs = (member.jobs ?? []).flatMap((entry) => {
      const job = entry.job?.trim()

      return job ? [job] : []
    })

    if (jobs.length === 0) {
      return [
        {
          id: member.id,
          name: member.name,
          profile_path: member.profile_path ?? null,
        },
      ]
    }

    return jobs.map((job) => ({
      id: member.id,
      job,
      name: member.name,
      profile_path: member.profile_path ?? null,
    }))
  })
}

// Trimmed names without blanks or repeats, in first-seen order.
function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const name of names) {
    const trimmed = name.trim()

    if (!trimmed || seen.has(trimmed)) {
      continue
    }

    seen.add(trimmed)
    unique.push(trimmed)
  }

  return unique
}
