'use client'

import { Film, Tv } from 'lucide-react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import type { SearchMediaType } from '../../types'

type TitleSearchMediaTypeToggleProps = {
  disabled?: boolean
  mediaType: SearchMediaType
  onMediaTypeChange: (mediaType: SearchMediaType) => void
}

export function TitleSearchMediaTypeToggle({
  disabled = false,
  mediaType,
  onMediaTypeChange,
}: TitleSearchMediaTypeToggleProps) {
  const handleChange = (value: string[]) => {
    const next = value[0]

    if (next !== 'movie' && next !== 'tv') {
      return
    }

    onMediaTypeChange(next)
  }

  return (
    <ToggleGroup
      aria-label="Movie or TV"
      className="w-full"
      disabled={disabled}
      onValueChange={handleChange}
      size="sm"
      value={[mediaType]}
      variant="outline"
    >
      <ToggleGroupItem className="flex flex-1 items-center justify-center gap-2" value="movie">
        <Film />
        Film
      </ToggleGroupItem>
      <ToggleGroupItem className="flex flex-1 items-center justify-center gap-2" value="tv">
        <Tv />
        TV
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
