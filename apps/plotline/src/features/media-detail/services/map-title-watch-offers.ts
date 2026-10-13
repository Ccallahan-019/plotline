import type {
  TmdbTitleWatchProviderCountry,
  TmdbTitleWatchProviders,
  TmdbWatchProvider,
} from '@plotline/shared/tmdb'

import type {
  TitleWatchOffer,
  TitleWatchOfferGroup,
  TitleWatchOfferLabel,
  TitleWatchOffers,
  TitleWatchRegionOffers,
} from '../types'

type OfferGroupDefinition = {
  label: TitleWatchOfferLabel
  source: OfferListKey
}

type OfferListKey = 'ads' | 'buy' | 'flatrate' | 'free' | 'rent'

type RankedOffer = {
  priority: null | number
} & TitleWatchOffer

const OFFER_GROUPS: readonly OfferGroupDefinition[] = [
  { label: 'Stream', source: 'flatrate' },
  { label: 'Free', source: 'free' },
  { label: 'Ads', source: 'ads' },
  { label: 'Rent', source: 'rent' },
  { label: 'Buy', source: 'buy' },
]

/**
 * Maps a TMDB per-title watch-provider payload to offer groups for every country.
 *
 * Groups stay in Stream, Free, Ads, Rent, Buy order, and empty lists are omitted.
 * Within a group, a repeated provider is kept once at its lower `display_priority`,
 * then sorted by that priority and name. A country TMDB returns with no offers stays
 * in the map with an empty group list. Countries TMDB omits are left out.
 *
 * @param response - Parsed `/movie/{id}/watch/providers` or `/tv/{id}/watch/providers` body
 * @returns Country codes mapped to a watch-page link and ordered offer groups
 */
export function mapTitleWatchOffers(response: TmdbTitleWatchProviders): TitleWatchOffers {
  return Object.fromEntries(
    Object.entries(response.results).map(([region, country]) => [region, mapRegionOffers(country)]),
  )
}

// Orders offers by display priority, then provider name. Missing priorities sort last.
function compareOffers(left: RankedOffer, right: RankedOffer): number {
  const priorityOrder = comparePriority(left.priority, right.priority)

  if (priorityOrder !== 0) {
    return priorityOrder
  }

  return left.name.localeCompare(right.name)
}

// Missing priority sorts after every numbered priority.
function comparePriority(left: null | number, right: null | number): number {
  if (left == null && right == null) {
    return 0
  }

  if (left == null) {
    return 1
  }

  if (right == null) {
    return -1
  }

  return left - right
}

// True when `next` should replace the offer already kept for this provider.
function isLowerDisplayPriority(next: null | number, current: null | number): boolean {
  if (next == null) {
    return false
  }

  if (current == null) {
    return true
  }

  return next < current
}

/**
 * Collapses one monetization list to unique providers.
 *
 * @param providers - `flatrate`, `free`, `ads`, `rent`, or `buy` entries for one country
 * @returns Offers sorted by display priority, then name
 */
function mapOfferList(providers: TmdbWatchProvider[] | undefined): TitleWatchOffer[] {
  if (!providers?.length) {
    return []
  }

  const byProviderId = new Map<number, RankedOffer>()

  for (const provider of providers) {
    const next = toRankedOffer(provider)
    const current = byProviderId.get(provider.provider_id)

    if (!current || isLowerDisplayPriority(next.priority, current.priority)) {
      byProviderId.set(provider.provider_id, next)
    }
  }

  return [...byProviderId.values()].sort(compareOffers).map(toTitleWatchOffer)
}

// Builds one country entry, dropping monetization lists that have no providers.
function mapRegionOffers(country: TmdbTitleWatchProviderCountry): TitleWatchRegionOffers {
  const groups: TitleWatchOfferGroup[] = []

  for (const definition of OFFER_GROUPS) {
    const offers = mapOfferList(country[definition.source])

    if (offers.length === 0) {
      continue
    }

    groups.push({ label: definition.label, offers })
  }

  return {
    groups,
    link: country.link ?? null,
  }
}

// Copies the provider fields the title page renders, plus priority for sorting.
function toRankedOffer(provider: TmdbWatchProvider): RankedOffer {
  return {
    logoPath: provider.logo_path ?? null,
    name: provider.provider_name,
    priority: provider.display_priority ?? null,
    providerId: provider.provider_id,
  }
}

// Drops display priority after it has been used for dedupe and sort.
function toTitleWatchOffer({ logoPath, name, providerId }: RankedOffer): TitleWatchOffer {
  return { logoPath, name, providerId }
}
