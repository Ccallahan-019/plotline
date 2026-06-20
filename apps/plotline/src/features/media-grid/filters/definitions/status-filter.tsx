import type { MediaStatus } from '@plotline/shared/constants/media'

import { MEDIA_STATUS_LABELS } from '@/features/library/constants/media-status-options'

import type { FilterDefinition, FilterFieldRenderProps, FilterRenderContext } from '../types'

import { CollapsibleCheckboxGroup } from '../components/CollapsibleCheckboxGroup'

export const STATUS_FILTER_KEY = 'status'

function getStatusBadgeLabel(statuses: MediaStatus[], context: FilterRenderContext): string {
  const labelById = new Map((context.statusOptions ?? []).map((option) => [option.id, option.name]))

  return statuses.map((status) => labelById.get(status) ?? MEDIA_STATUS_LABELS[status]).join(', ')
}

function StatusFilterField({ context, draftFilters, setDraftFilters }: FilterFieldRenderProps) {
  const statusOptions =
    context.statusOptions ??
    Object.entries(MEDIA_STATUS_LABELS).map(([id, name]) => ({
      id,
      name,
    }))

  const selectedStatuses = draftFilters.statuses ?? []

  const handleChange = (selectedIds: (number | string)[]) => {
    setDraftFilters({
      ...draftFilters,
      statuses: selectedIds.length > 0 ? (selectedIds as MediaStatus[]) : undefined,
    })
  }

  return (
    <CollapsibleCheckboxGroup
      fieldIdPrefix="status"
      items={statusOptions}
      label="Status"
      onChange={handleChange}
      selectedIds={selectedStatuses}
      showAllLabel={`Show all ${statusOptions.length} statuses`}
    />
  )
}

export const statusFilterDefinition: FilterDefinition = {
  group: 'library',
  key: STATUS_FILTER_KEY,
  label: 'Status',
  remove: (filters) => {
    const next = { ...filters }
    delete next.statuses
    return next
  },
  render: (props) => <StatusFilterField {...props} />,
  toBadge: (filters, context) => {
    if (!filters.statuses?.length) {
      return null
    }

    return {
      key: STATUS_FILTER_KEY,
      label: getStatusBadgeLabel(filters.statuses, context),
      prefix: 'Status',
    }
  },
}
