import type { MediaType } from '@plotline/shared/constants/media'

import type { FilterDefinition, FilterFieldRenderProps, FilterRenderContext } from '../types'

import { CollapsibleCheckboxGroup } from '../components/CollapsibleCheckboxGroup'

export const MEDIA_TYPE_FILTER_KEY = 'media-type'

const DEFAULT_MEDIA_TYPE_OPTIONS = [
  { id: 'movie', name: 'Movies' },
  { id: 'tv', name: 'TV Shows' },
]

function getMediaTypeBadgeLabel(mediaTypes: MediaType[], context: FilterRenderContext): string {
  const labelById = new Map(
    (context.mediaTypeOptions ?? DEFAULT_MEDIA_TYPE_OPTIONS).map((option) => [
      option.id,
      option.name,
    ]),
  )

  return mediaTypes.map((mediaType) => labelById.get(mediaType) ?? mediaType).join(', ')
}

function MediaTypeFilterField({ context, draftFilters, setDraftFilters }: FilterFieldRenderProps) {
  const mediaTypeOptions = context.mediaTypeOptions ?? DEFAULT_MEDIA_TYPE_OPTIONS
  const selectedMediaTypes = draftFilters.mediaTypes ?? []

  const handleChange = (selectedIds: (number | string)[]) => {
    setDraftFilters({
      ...draftFilters,
      mediaTypes: selectedIds.length > 0 ? (selectedIds as MediaType[]) : undefined,
    })
  }

  return (
    <CollapsibleCheckboxGroup
      fieldIdPrefix="media-type"
      items={mediaTypeOptions}
      label="Media Type"
      onChange={handleChange}
      selectedIds={selectedMediaTypes}
    />
  )
}

export const mediaTypeFilterDefinition: FilterDefinition = {
  group: 'library',
  key: MEDIA_TYPE_FILTER_KEY,
  label: 'Media Type',
  remove: (filters) => {
    const next = { ...filters }
    delete next.mediaTypes
    return next
  },
  render: (props) => <MediaTypeFilterField {...props} />,
  toBadge: (filters, context) => {
    if (!filters.mediaTypes?.length) {
      return null
    }

    return {
      key: MEDIA_TYPE_FILTER_KEY,
      label: getMediaTypeBadgeLabel(filters.mediaTypes, context),
      prefix: 'Type',
    }
  },
}
