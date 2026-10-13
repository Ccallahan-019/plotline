'use client'

import { Tv } from 'lucide-react'
import { useMemo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldGroup } from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'

import type { LogWatchFormApi } from '../../../hooks/use-log-watch-form'
import type { LogWatchWatchedCoverage } from '../../../services/episode-field'

import { useLogWatchEpisodesField } from '../../../hooks/use-log-watch-episodes-field'
import {
  syncQuickLogEpisodeFromSelection,
  toLogWatchWatchedEpisodeKeys,
  upsertSelectedEpisode,
} from '../../../services/episode-field'
import { EpisodesFieldSeasonSelector } from './EpisodesFieldSeasonSelector'
import { TmdbEpisodeList } from './TmdbEpisodeList'

type LogWatchEpisodesFieldProps = {
  disabled?: boolean
  form: LogWatchFormApi
  seasonCount?: null | number
  tmdbId?: null | number
  watchedCoverage?: LogWatchWatchedCoverage
}

export function LogWatchEpisodesField({
  disabled = false,
  form,
  seasonCount,
  tmdbId,
  watchedCoverage,
}: LogWatchEpisodesFieldProps) {
  const defaultSeason =
    form.getFieldValue('episode')?.season ?? form.getFieldValue('episodes')[0]?.season ?? 1
  const { data, isPending, season, seasonOptions, setSeason, showTmdbEpisodeList } =
    useLogWatchEpisodesField({
      defaultSeason,
      seasonCount,
      tmdbId,
    })
  const showCompleted = watchedCoverage?.showCompleted === true
  const watchedEpisodeKeys = useMemo(
    () => toLogWatchWatchedEpisodeKeys(watchedCoverage?.watchedEpisodes ?? []),
    [watchedCoverage?.watchedEpisodes],
  )

  return (
    <Card className="mx-0.5 mb-0.5" size="sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Tv className="size-3 text-muted-foreground" />
          <CardTitle className="leading-none">Episodes Watched</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup className="gap-4">
          <Field data-disabled={disabled}>
            <FieldContent>
              <EpisodesFieldSeasonSelector
                disabled={disabled}
                season={season}
                seasonOptions={seasonOptions}
                setSeason={setSeason}
              />
            </FieldContent>
          </Field>

          <form.AppField
            listeners={{
              onChange: () => {
                syncQuickLogEpisodeFromSelection(form)
              },
            }}
            name="episodes"
          >
            {(field) => {
              const selectedEpisodes = field.state.value
              const otherSeasonCount = selectedEpisodes.filter(
                (entry) => entry.season !== season,
              ).length

              const handleSelectedChange = (
                nextSeason: number,
                nextEpisode: number,
                selected: boolean,
              ) => {
                field.handleChange(
                  upsertSelectedEpisode(
                    selectedEpisodes,
                    {
                      episode: nextEpisode,
                      season: nextSeason,
                    },
                    selected,
                  ),
                )
              }

              return (
                <Field data-disabled={disabled}>
                  <ShowIf condition={otherSeasonCount > 0}>
                    <FieldDescription>
                      {otherSeasonCount} episode{otherSeasonCount === 1 ? '' : 's'} from other
                      seasons also selected
                    </FieldDescription>
                  </ShowIf>

                  <TmdbEpisodeList
                    disabled={disabled}
                    isPending={isPending}
                    onSelectedChange={handleSelectedChange}
                    season={season}
                    selectedEpisodes={selectedEpisodes}
                    showCompleted={showCompleted}
                    showTmdbEpisodeList={showTmdbEpisodeList}
                    tmdbEpisodes={data?.episodes ?? []}
                    watchedEpisodeKeys={watchedEpisodeKeys}
                  />

                  <field.FormFieldError />
                </Field>
              )
            }}
          </form.AppField>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
