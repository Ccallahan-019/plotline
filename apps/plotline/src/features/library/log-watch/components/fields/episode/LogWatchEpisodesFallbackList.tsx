'use client'

import { ChangeEvent, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ShowIf } from '@/components/utils/ShowIf'

import type { LogWatchEpisodeInput } from '../../../services/log-watch-form-schema'

import { formatEpisodeOption, isEpisodeSelected, isLoggedEpisodeWatched } from '../../../services/episode-field'
import { LogWatchEpisodeRow } from './LogWatchEpisodeRow'

type LogWatchEpisodesFallbackListProps = {
  disabled?: boolean
  onSelectedChange: (season: number, episode: number, selected: boolean) => void
  season: number
  selectedEpisodes: readonly LogWatchEpisodeInput[]
  showCompleted: boolean
  watchedEpisodeKeys: ReadonlySet<string>
}

export function LogWatchEpisodesFallbackList({
  disabled = false,
  onSelectedChange,
  season,
  selectedEpisodes,
  showCompleted,
  watchedEpisodeKeys,
}: LogWatchEpisodesFallbackListProps) {
  const [draftEpisode, setDraftEpisode] = useState(1)
  const [seasonForDraft, setSeasonForDraft] = useState(season)

  // Same rule as `syncQuickLogEpisodeAfterSeasonChange`: a leftover draft from the
  // previous season must not be added under the newly selected season.
  if (seasonForDraft !== season) {
    setSeasonForDraft(season)
    setDraftEpisode(1)
  }

  const canAdd =
    Number.isInteger(draftEpisode) &&
    draftEpisode >= 0 &&
    !isEpisodeSelected(selectedEpisodes, season, draftEpisode)

  const handleAdd = () => {
    if (!canAdd) {
      return
    }

    onSelectedChange(season, draftEpisode, true)
    setDraftEpisode(draftEpisode + 1)
  }

  const handleEpisodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value)
    setDraftEpisode(Number.isNaN(nextValue) ? 0 : nextValue)
  }

  return (
    <div className="flex flex-col gap-3">
      <Field data-disabled={disabled}>
        <FieldLabel htmlFor="log-watch-fallback-episode">Episode number</FieldLabel>
        <FieldContent className="flex-row items-center gap-2">
          <Input
            aria-label="Episode number"
            disabled={disabled}
            id="log-watch-fallback-episode"
            min={0}
            onChange={handleEpisodeChange}
            type="number"
            value={draftEpisode}
          />
          <Button
            disabled={disabled || !canAdd}
            onClick={handleAdd}
            type="button"
            variant="outline"
          >
            Add
          </Button>
        </FieldContent>
      </Field>

      <ShowIf condition={selectedEpisodes.length > 0}>
        <div className="flex max-h-56 flex-col gap-2 overflow-y-auto" data-slot="checkbox-group">
          {selectedEpisodes.map((entry) => {
            const selectedId = `log-watch-episode-${entry.season}-${entry.episode}`

            return (
              <LogWatchEpisodeRow
                disabled={disabled}
                isSelected
                isWatched={isLoggedEpisodeWatched(entry.season, entry.episode, {
                  showCompleted,
                  watchedEpisodeKeys,
                })}
                key={`${entry.season}-${entry.episode}`}
                label={formatEpisodeOption(entry.season, entry.episode)}
                onSelectedChange={(checked) => {
                  onSelectedChange(entry.season, entry.episode, checked)
                }}
                selectedId={selectedId}
              />
            )
          })}
        </div>
      </ShowIf>
    </div>
  )
}
