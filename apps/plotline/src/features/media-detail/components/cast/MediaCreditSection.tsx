import type { MediaTitleCreditCard } from '../../types'

import { MediaCreditListItem } from './MediaCreditListItem'

type MediaCreditSectionProps = {
  people: MediaTitleCreditCard[]
  title: string
}

export function MediaCreditSection({ people, title }: MediaCreditSectionProps) {
  if (people.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-base font-medium">{title}</h2>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {people.map((member) => (
          <MediaCreditListItem key={member.id} member={member} />
        ))}
      </ul>
    </section>
  )
}
