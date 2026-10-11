import Link from 'next/link'

type ExternalWatchLinkProps = {
  link?: null | string
}

export function ExternalWatchLink({ link }: ExternalWatchLinkProps) {
  if (!isExternalWatchLink(link)) return null

  return (
    <Link
      className="w-fit text-xs font-medium underline-offset-4 hover:underline"
      href={link}
      rel="noopener noreferrer"
      target="_blank"
    >
      View Watch Options
    </Link>
  )
}

// TMDB watch links are absolute https URLs. Other values are not rendered.
function isExternalWatchLink(value: null | string | undefined): value is string {
  return typeof value === 'string' && value.startsWith('https://')
}
