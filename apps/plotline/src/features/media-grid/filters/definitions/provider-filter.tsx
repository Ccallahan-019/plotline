import type { FilterDefinition, FilterFieldRenderProps, FilterRenderContext } from '../types'

import { CollapsibleCheckboxGroup } from '../components/CollapsibleCheckboxGroup'

export const PROVIDER_FILTER_KEY = 'streaming'

function getProviderBadgeLabel(providerIds: number[], context: FilterRenderContext): string {
  const labelById = context.providerNameById

  return providerIds
    .map((providerId) => labelById?.get(providerId) ?? `Provider ${providerId}`)
    .join(', ')
}

function ProviderFilterField({ context, draftFilters, setDraftFilters }: FilterFieldRenderProps) {
  const providers = context.providers ?? []
  const selectedProviderIds = draftFilters.providerIds ?? []
  const regionLabel = context.providerRegion ? ` (${context.providerRegion})` : ''

  if (providers.length === 0) {
    return null
  }

  const handleChange = (selectedIds: (number | string)[]) => {
    setDraftFilters({
      ...draftFilters,
      providerIds: selectedIds.length > 0 ? selectedIds.map((id) => Number(id)) : undefined,
    })
  }

  return (
    <CollapsibleCheckboxGroup
      fieldIdPrefix="provider"
      items={providers}
      label={`Streaming Services${regionLabel}`}
      onChange={handleChange}
      selectedIds={selectedProviderIds}
      showAllLabel={`Show all ${providers.length} providers`}
    />
  )
}

export const providerFilterDefinition: FilterDefinition = {
  group: 'tmdb',
  isEnabled: (context) => (context.providers?.length ?? 0) > 0,
  key: PROVIDER_FILTER_KEY,
  label: 'Streaming Services',
  remove: (filters) => {
    const next = { ...filters }
    delete next.providerIds
    return next
  },
  render: (props) => <ProviderFilterField {...props} />,
  toBadge: (filters, context) => {
    if (!filters.providerIds?.length) {
      return null
    }

    return {
      key: PROVIDER_FILTER_KEY,
      label: getProviderBadgeLabel(filters.providerIds, context),
      prefix: 'Streaming',
    }
  },
}
