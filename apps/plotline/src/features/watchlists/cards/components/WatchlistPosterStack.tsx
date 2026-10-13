import { WatchlistCardPreview } from '../types'
import { WatchlistPosterFrame } from './WatchlistPosterFrame'

type WatchlistPosterStackProps = {
  previews: readonly WatchlistCardPreview[]
}

// Later frames sit on top of earlier ones. No titles still leaves one empty frame.
export function WatchlistPosterStack({ previews }: WatchlistPosterStackProps) {
  const frames = previews.length > 0 ? previews : [null]

  return (
    <div aria-hidden="true" className="flex items-end">
      {frames.map((preview, index) => (
        <WatchlistPosterFrame
          className={index > 0 ? '-ml-10' : undefined}
          index={index}
          key={index}
          preview={preview}
          style={{ zIndex: index + 1 }}
        />
      ))}
    </div>
  )
}
