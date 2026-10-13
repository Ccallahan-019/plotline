'use client'

import { FileQuestion } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useSyncUnavailableTitleBreadcrumb } from '@/features/navigation/breadcrumbs/hooks/use-sync-title-breadcrumb'

export default function MediaTitleNotFound() {
  useSyncUnavailableTitleBreadcrumb()

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion />
            </EmptyMedia>
            <EmptyTitle>Title Unavailable</EmptyTitle>
            <EmptyDescription>This movie or show could not be found.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  )
}
