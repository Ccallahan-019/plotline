'use client'

import { useState } from 'react'

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

const WATCH_REGIONS = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'BR', 'MX', 'IN'] as const

type MediaWhereToWatchProps = {
  region: string
}

export function MediaWhereToWatch({ region }: MediaWhereToWatchProps) {
  const initialRegion = region.trim().toUpperCase() || 'US'
  const [selectedRegion, setSelectedRegion] = useState(initialRegion)
  const options = WATCH_REGIONS.includes(selectedRegion as (typeof WATCH_REGIONS)[number])
    ? WATCH_REGIONS
    : [selectedRegion, ...WATCH_REGIONS]

  const handleRegionChange = (value: null | string) => {
    if (!value) {
      return
    }

    setSelectedRegion(value)
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-medium">Where to Watch</h2>
        <Select onValueChange={handleRegionChange} value={selectedRegion}>
          <SelectTrigger aria-label="Watch region" className="w-24">
            {selectedRegion}
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ItemGroup>
        <Item variant="outline">
          <ItemMedia>
            <div className="size-10 rounded-md bg-muted" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Placeholder Streaming Service</ItemTitle>
            <ItemDescription>Stream · Subscription</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </section>
  )
}
