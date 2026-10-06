'use client'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

import { useBrowseMode } from '../../providers/BrowseModeProvider'
import { useTmdbBrowse } from '../../providers/TmdbBrowseProvider'
import { getSearchEmptyCopy } from '../../services/get-search-empty-copy'

export function SearchResultEmpty() {
  const { mode } = useBrowseMode()
  const { query, showPrompt } = useTmdbBrowse()

  const { description, icon, title } = getSearchEmptyCopy(mode, showPrompt, query)

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
