import { useOpenState } from '@/providers/OpenStateProvider'

import { useFilterErrors } from '../providers/FilterErrorsProvider'
import { useFilterRegistry } from '../providers/FilterRegistryProvider'
import { useFilters } from '../providers/FiltersProvider'
import { hasValidationErrors, validateFilters } from '../services/validate-filters'

type UseApplyFiltersOptions = {
  onApply?: () => void
}

export function useApplyFilters(options?: UseApplyFiltersOptions) {
  const { setIsOpen } = useOpenState()
  const { applyDraft, draftFilters } = useFilters()
  const { clearErrors, setErrors } = useFilterErrors()
  const { definitions } = useFilterRegistry()

  const handleApply = () => {
    const errors = validateFilters(draftFilters, definitions)

    setErrors(errors)

    if (hasValidationErrors(errors)) {
      return
    }

    clearErrors()
    applyDraft()
    options?.onApply?.()
    setIsOpen(false)
  }

  return {
    handleApply,
  }
}
