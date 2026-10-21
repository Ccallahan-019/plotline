'use client'

import { ChevronRight } from 'lucide-react'

import type { LibraryItemsResponse } from '@/features/library/library-grid/types'

import { ButtonLink } from '@/components/buttons/ButtonLink'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { DashboardUpNextContent } from './DashboardUpNextContent'

type DashboardUpNextProps = {
  initialData?: LibraryItemsResponse
}

export function DashboardUpNext({ initialData }: DashboardUpNextProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Up Next</CardTitle>
        <CardAction>
          <ButtonLink href="/dashboard/continue-watching" size="sm" variant="ghost">
            Your Queue
            <ChevronRight className="size-4" />
          </ButtonLink>
        </CardAction>
      </CardHeader>
      <CardContent>
        <DashboardUpNextContent initialData={initialData} />
      </CardContent>
    </Card>
  )
}
