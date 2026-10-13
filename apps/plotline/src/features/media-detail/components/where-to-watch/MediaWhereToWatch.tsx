'use client'

import type { MediaType } from '@plotline/shared/constants'

import { useState } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

import { useTitleWatchOffers } from '../../hooks/use-title-watch-offers'
import { WatchOffersBody } from './WatchOffersBody'

const WATCH_REGIONS = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'BR', 'MX', 'IN'] as const

type MediaWhereToWatchProps = {
  mediaType: MediaType
  region: string
  tmdbId: number
}

export function MediaWhereToWatch({ mediaType, region, tmdbId }: MediaWhereToWatchProps) {
  const initialRegion = region.trim().toUpperCase() || 'US'
  const [selectedRegion, setSelectedRegion] = useState(initialRegion)
  const query = useTitleWatchOffers(mediaType, tmdbId)
  const regionOptions = isCuratedWatchRegion(selectedRegion)
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
            {regionOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <WatchOffersBody query={query} region={selectedRegion} />
    </section>
  )
}

// True when the profile region is already one of the curated country codes.
function isCuratedWatchRegion(region: string): region is (typeof WATCH_REGIONS)[number] {
  return WATCH_REGIONS.some((option) => option === region)
}
