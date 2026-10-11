import Image from 'next/image'

const JUSTWATCH_HREF = 'https://www.justwatch.com'

// TMDB requires a JustWatch credit wherever per-title watch offers are shown.
// The gold mark stays visible on both light and dark backgrounds.
export function JustWatchCredit() {
  return (
    <a
      className="flex w-fit flex-nowrap items-center gap-2"
      href={JUSTWATCH_HREF}
      rel="noopener noreferrer"
      target="_blank"
    >
      <p className="text-xs text-muted-foreground leading-none">Powered by</p>
      <Image
        alt="JustWatch"
        className="h-3 w-auto"
        height={20}
        src="/justwatch-logo.svg"
        width={132}
      />
    </a>
  )
}
