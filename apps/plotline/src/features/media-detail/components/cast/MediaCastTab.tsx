import type {
  MediaTitleCastMember,
  MediaTitleCrewMember,
  MediaTitleKeyCreditGroup,
} from '../../types'

import { MediaCreditSection } from './MediaCreditSection'
import { MediaKeyCredits } from './MediaKeyCredits'

type MediaCastTabProps = {
  cast: MediaTitleCastMember[]
  crew: MediaTitleCrewMember[]
  keyCredits: MediaTitleKeyCreditGroup[]
}

export function MediaCastTab({ cast, crew, keyCredits }: MediaCastTabProps) {
  if (cast.length === 0 && crew.length === 0 && keyCredits.length === 0) {
    return <p className="text-sm text-muted-foreground">Cast and crew are not available yet.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b pb-4">
        <MediaKeyCredits groups={keyCredits} />
      </div>
      <MediaCreditSection
        people={cast.map((member) => ({
          id: member.id,
          initials: member.initials,
          name: member.name,
          profilePath: member.profilePath,
          subtitle: member.character,
        }))}
        title="Cast"
      />
      <MediaCreditSection
        people={crew.map((member) => ({
          id: member.id,
          initials: member.initials,
          name: member.name,
          profilePath: member.profilePath,
          subtitle: member.jobs,
        }))}
        title="Crew"
      />
    </div>
  )
}
