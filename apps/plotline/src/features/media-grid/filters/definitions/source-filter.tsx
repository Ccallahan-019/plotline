import type { FilterDefinition, FilterFieldRenderProps, FilterRenderContext } from '../types'

import { CollapsibleCheckboxGroup } from '../components/CollapsibleCheckboxGroup'
import { LIBRARY_ITEM_SOURCE_LABELS, LIBRARY_ITEM_SOURCES, LibraryItemSource } from '../constants'

export const SOURCE_FILTER_KEY = 'source'

const DEFAULT_SOURCE_OPTIONS = LIBRARY_ITEM_SOURCES.map((source) => ({
  id: source,
  name: LIBRARY_ITEM_SOURCE_LABELS[source],
}))

function getSourceBadgeLabel(sources: LibraryItemSource[], context: FilterRenderContext): string {
  const labelById = new Map(
    (context.sourceOptions ?? DEFAULT_SOURCE_OPTIONS).map((option) => [option.id, option.name]),
  )

  return sources
    .map((source) => labelById.get(source) ?? LIBRARY_ITEM_SOURCE_LABELS[source])
    .join(', ')
}

function SourceFilterField({ context, draftFilters, setDraftFilters }: FilterFieldRenderProps) {
  const sourceOptions = context.sourceOptions ?? DEFAULT_SOURCE_OPTIONS
  const selectedSources = draftFilters.sources ?? []

  const handleChange = (selectedIds: (number | string)[]) => {
    setDraftFilters({
      ...draftFilters,
      sources: selectedIds.length > 0 ? (selectedIds as LibraryItemSource[]) : undefined,
    })
  }

  return (
    <CollapsibleCheckboxGroup
      fieldIdPrefix="source"
      items={sourceOptions}
      label="Source"
      onChange={handleChange}
      selectedIds={selectedSources}
    />
  )
}

export const sourceFilterDefinition: FilterDefinition = {
  group: 'library',
  key: SOURCE_FILTER_KEY,
  label: 'Source',
  remove: (filters) => {
    const next = { ...filters }
    delete next.sources
    return next
  },
  render: (props) => <SourceFilterField {...props} />,
  toBadge: (filters, context) => {
    if (!filters.sources?.length) {
      return null
    }

    return {
      key: SOURCE_FILTER_KEY,
      label: getSourceBadgeLabel(filters.sources, context),
      prefix: 'Source',
    }
  },
}
