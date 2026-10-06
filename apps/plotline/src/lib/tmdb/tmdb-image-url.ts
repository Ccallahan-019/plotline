const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/w45'

export function tmdbLogoUrl(logoPath: string): string {
  return `${TMDB_LOGO_BASE}${logoPath}`
}
