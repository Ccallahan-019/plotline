'use client'

import { ErrorEmpty } from '@/components/utils/ErrorEmpty'
import { useSyncUnavailableTitleBreadcrumb } from '@/features/navigation/breadcrumbs/hooks/use-sync-title-breadcrumb'

export default function MediaTitleError({ error }: { error: Error }) {
  useSyncUnavailableTitleBreadcrumb()

  return (
    <ErrorEmpty
      description="Check that the Payload app is running and TMDB is configured, then try again."
      errorMessage={error.message}
      title="Could not load this title"
    />
  )
}
