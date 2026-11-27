import type {
  MediaTitleCastMember,
  MediaTitleCreditCard,
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
      <MediaCreditSection people={cast.map(toCastCreditCard)} title="Cast" />
      <MediaCreditSection people={crew.map(toCrewCreditCard)} title="Crew" />
    </div>
  )
}

// One cast credit card. The character name is the subtitle.
function toCastCreditCard(member: MediaTitleCastMember): MediaTitleCreditCard {
  const { character, id, name, profilePath } = member

  return {
    id,
    name,
    profilePath,
    subtitle: character,
  }
}

// One crew credit card. Joined jobs are the subtitle.
function toCrewCreditCard(member: MediaTitleCrewMember): MediaTitleCreditCard {
  const { id, jobs, name, profilePath } = member

  return {
    id,
    name,
    profilePath,
    subtitle: jobs,
  }
}
