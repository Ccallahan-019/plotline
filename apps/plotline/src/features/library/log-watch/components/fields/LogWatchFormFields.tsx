'use client'

import type { Media } from '@plotline/payload-types'

import { FieldGroup } from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'

import type { LogWatchFormApi } from '../../hooks/use-log-watch-form'

import { LogWatchEpisodeOrEpisodesField } from './episode/LogWatchEpisodeOrEpisodesField'
import { LogWatchRewatchField } from './LogWatchRewatchField'
import { LogWatchPlatformField } from './platform/LogWatchPlatformField'
import { PlatformOtherField } from './platform/PlatformOtherField'
import { LogWatchWhenField } from './when/LogWatchWhenField'

type LogWatchFormFieldsProps = {
  episodeMode?: 'multi' | 'single'
  form: LogWatchFormApi
  isSubmitting: boolean
  media: Media
  platformLayout?: 'compact' | 'expanded'
}

export function LogWatchFormFields({
  episodeMode = 'single',
  form,
  isSubmitting,
  media,
  platformLayout = 'compact',
}: LogWatchFormFieldsProps) {
  const whenMode = platformLayout === 'compact' ? 'popover' : 'dialog'

  return (
    <FieldGroup>
      <LogWatchWhenField disabled={isSubmitting} form={form} mode={whenMode} />
      <LogWatchPlatformField disabled={isSubmitting} form={form} layout={platformLayout} />

      <form.Subscribe selector={(state) => state.values.platform === 'other'}>
        {(isOther) => (
          <ShowIf condition={isOther}>
            <PlatformOtherField disabled={isSubmitting} form={form} />
          </ShowIf>
        )}
      </form.Subscribe>

      <ShowIf condition={media.mediaType === 'tv'}>
        <LogWatchEpisodeOrEpisodesField
          disabled={isSubmitting}
          episodeMode={episodeMode}
          form={form}
          media={media}
        />
      </ShowIf>

      <ShowIf condition={media.mediaType === 'movie'}>
        <LogWatchRewatchField disabled={isSubmitting} form={form} />
      </ShowIf>
    </FieldGroup>
  )
}
