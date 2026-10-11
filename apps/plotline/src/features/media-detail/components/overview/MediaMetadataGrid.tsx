import type { MediaMetadataRow } from '../../services/format-media-title'

type MediaMetadataGridProps = {
  rows: MediaMetadataRow[]
}

export function MediaMetadataGrid({ rows }: MediaMetadataGridProps) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
      {rows.map((row) => (
        <div className="min-w-0" key={row.label}>
          <dt className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {row.label}
          </dt>
          <dd className="mt-1 text-sm">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
