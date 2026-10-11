import type { MediaTitleKeyCreditGroup } from '../../types'

import { MediaKeyCreditNames } from './MediaKeyCreditNames'

type MediaKeyCreditsProps = {
  groups: MediaTitleKeyCreditGroup[]
}

export function MediaKeyCredits({ groups }: MediaKeyCreditsProps) {
  if (groups.length === 0) {
    return null
  }

  return (
    <dl className="flex gap-x-8 gap-y-4 flex-wrap">
      {groups.map((group) => (
        <div className="flex flex-col gap-1" key={group.label}>
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {group.label}
          </dt>
          <MediaKeyCreditNames label={group.label} names={group.names} />
        </div>
      ))}
    </dl>
  )
}
