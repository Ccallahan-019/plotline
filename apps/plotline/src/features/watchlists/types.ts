/** Which index a card query belongs to. `list` omits challenges. */
export type WatchlistCardFilter = 'challenge' | 'list'

/** Kind filter for watchlist queries. `list` is every watchlist that is not a challenge. */
export type WatchlistListFilter = 'challenge' | 'custom' | 'list' | 'system'
