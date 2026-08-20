'use client'

import type { Media } from '@plotline/payload-types'

import { FieldGroup } from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'

import type { LogWatchFormApi } from '../../hooks/use-log-watch-form'

import { LogWatchEpisodeField } from './episode/LogWatchEpisodeField'
import { LogWatchRewatchField } from './LogWatchRewatchField'
import { LogWatchWhenField } from './LogWatchWhenField'
import { LogWatchPlatformField } from './platform/LogWatchPlatformField'
import { PlatformOtherField } from './platform/PlatformOtherField'

type LogWatchFormFieldsProps = {
  form: LogWatchFormApi
  isSubmitting: boolean
  media: Media
  platformLayout?: 'compact' | 'expanded'
}

export function LogWatchFormFields({
  form,
  isSubmitting,
  media,
  platformLayout = 'compact',
}: LogWatchFormFieldsProps) {
  return (
    <FieldGroup>
      <LogWatchWhenField disabled={isSubmitting} form={form} />
      <LogWatchPlatformField disabled={isSubmitting} form={form} layout={platformLayout} />

      <form.Subscribe selector={(state) => state.values.platform === 'other'}>
        {(isOther) => (
          <ShowIf condition={isOther}>
            <PlatformOtherField disabled={isSubmitting} form={form} />
          </ShowIf>
        )}
      </form.Subscribe>

      <ShowIf condition={media.mediaType === 'tv'}>
        <LogWatchEpisodeField
          disabled={isSubmitting}
          form={form}
          seasonCount={media.tvMeta?.seasonCount}
          tmdbId={media.tmdbId}
        />
      </ShowIf>

      <ShowIf condition={media.mediaType === 'movie'}>
        <LogWatchRewatchField disabled={isSubmitting} form={form} />
      </ShowIf>
    </FieldGroup>
  )
}
