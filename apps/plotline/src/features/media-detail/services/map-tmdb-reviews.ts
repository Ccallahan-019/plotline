import type { TmdbReview, TmdbReviewsResponse } from '@plotline/shared/tmdb'

import type { TmdbCommunityReview, TmdbCommunityReviewPage } from '../types'

import { formatPersonInitials } from './format-person-initials'
import { mediaImageUrl } from './media-image-url'

const AVATAR_SIZE = 'w185'

/**
 * Maps one TMDB reviews page to the title-page review list.
 *
 * @param response - Parsed TMDB reviews payload
 * @returns Author, avatar, body, and rating for each review, plus page totals
 */
export function mapTmdbCommunityReviews(response: TmdbReviewsResponse): TmdbCommunityReviewPage {
  return {
    page: response.page,
    reviews: response.results.map(mapTmdbCommunityReview),
    totalPages: response.total_pages,
    totalResults: response.total_results,
  }
}

/**
 * Maps one TMDB review onto the fields the ratings tab renders.
 *
 * @param review - One result from the TMDB reviews endpoint
 * @returns Display name, avatar, written date, body, and star rating
 */
function mapTmdbCommunityReview(review: TmdbReview): TmdbCommunityReview {
  const name = reviewAuthorName(review)
  const rating = review.author_details?.rating

  return {
    avatarUrl: resolveReviewAvatarUrl(review.author_details?.avatar_path),
    body: review.content?.trim() ?? '',
    id: review.id,
    initials: formatPersonInitials(name),
    name,
    rating: typeof rating === 'number' && Number.isFinite(rating) ? rating : null,
    writtenAt: review.created_at ?? '',
  }
}

/**
 * Turns a TMDB review avatar path into an image URL.
 *
 * Gravatar values are a full URL with a leading slash. Other values are TMDB file paths.
 *
 * @param avatarPath - `author_details.avatar_path`
 * @returns An absolute URL, or `null` when there is no avatar
 */
function resolveReviewAvatarUrl(avatarPath: null | string | undefined): null | string {
  const path = avatarPath?.trim()

  if (!path) {
    return null
  }

  const embedded = /^\/(https?:\/\/.+)$/.exec(path)

  if (embedded?.[1]) {
    return embedded[1]
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return mediaImageUrl(path.startsWith('/') ? path : `/${path}`, AVATAR_SIZE)
}

/**
 * Display name for a TMDB reviewer.
 *
 * Prefers the profile name, then the username, then the review author field.
 *
 * @param review - One TMDB review
 * @returns A non-empty name
 */
function reviewAuthorName(review: TmdbReview): string {
  const name = review.author_details?.name?.trim()

  if (name) {
    return name
  }

  const username = review.author_details?.username?.trim()

  if (username) {
    return username
  }

  const author = review.author?.trim()

  if (author) {
    return author
  }

  return 'TMDB User'
}
