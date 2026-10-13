'use client'

import type { Watchlist } from '@plotline/payload-types'
import type { Visibility } from '@plotline/shared/constants'
import type { SubmitEvent } from 'react'

import type { ToggleGroupFieldItem } from '@/features/forms/components/ToggleGroupField'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'
import { formatReleaseYear } from '@/features/media-grid/grid/services/media-display-helpers'

import type { WatchlistFormApi } from '../hooks/use-watchlist-form'
import type { WatchlistCoverOption } from './WatchlistCoverField'

import { watchlistFormSubmitLabel } from '../services/watchlist-form'
import { WatchlistChallengeFields } from './WatchlistChallengeFields'
import { WatchlistCoverField } from './WatchlistCoverField'

const VISIBILITY_ITEMS: ToggleGroupFieldItem<Visibility>[] = [
  { label: 'Private', value: 'private' },
  { label: 'Friends', value: 'friends' },
  { label: 'Public', value: 'public' },
  { label: 'Unlisted', value: 'unlisted' },
]

type WatchlistFormProps = {
  coverFallback?: null | WatchlistCoverOption
  form: WatchlistFormApi
  isSubmitting: boolean
  isSystem: boolean
  mode: 'create' | 'edit'
  onCancel: () => void
}

export function coverOptionFromWatchlist(watchlist: Watchlist): null | WatchlistCoverOption {
  const cover = watchlist.coverMedia

  if (cover == null) {
    return null
  }

  if (typeof cover === 'number') {
    return {
      id: cover,
      label: 'Selected title',
      mediaType: 'movie',
      year: null,
    }
  }

  return {
    id: cover.id,
    label: cover.title,
    mediaType: cover.mediaType,
    year: formatReleaseYear(cover.releaseDate),
  }
}

export function WatchlistForm({
  coverFallback = null,
  form,
  isSubmitting,
  isSystem,
  mode,
  onCancel,
}: WatchlistFormProps) {
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void form.handleSubmit()
  }
  const challengeSwitchDisabled = isSubmitting || isSystem

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <form.AppField name="name">
          {(field) => (
            <Field data-disabled={isSubmitting}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <FieldContent>
                <field.TextField autoFocus disabled={isSubmitting} />
              </FieldContent>
              <field.FormFieldError />
            </Field>
          )}
        </form.AppField>

        <form.AppField name="description">
          {(field) => (
            <Field data-disabled={isSubmitting}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <FieldContent>
                <field.TextAreaField
                  disabled={isSubmitting}
                  placeholder="Optional description..."
                  rows={4}
                />
              </FieldContent>
              <field.FormFieldError />
            </Field>
          )}
        </form.AppField>

        <form.AppField name="visibility">
          {(field) => (
            <Field data-disabled={isSubmitting}>
              <FieldLabel>Visibility</FieldLabel>
              <FieldContent>
                <field.ToggleGroupField<Visibility>
                  className="grid-cols-2 sm:grid-cols-4"
                  disabled={isSubmitting}
                  itemClassName="flex-1"
                  items={VISIBILITY_ITEMS}
                  spacing={0}
                  variant="outline"
                />
              </FieldContent>
              <field.FormFieldError />
            </Field>
          )}
        </form.AppField>

        <form.AppField name="coverMediaId">
          {(field) => (
            <Field data-disabled={isSubmitting}>
              <FieldLabel htmlFor={field.name}>Cover</FieldLabel>
              <FieldContent>
                <WatchlistCoverField
                  disabled={isSubmitting}
                  fallback={coverFallback}
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  value={field.state.value}
                />
              </FieldContent>
              <FieldDescription>
                Optionally pick a title from your library to use as the cover art for this
                watchlist.
              </FieldDescription>
              <field.FormFieldError />
            </Field>
          )}
        </form.AppField>

        <form.AppField name="challengeEnabled">
          {(field) => {
            const description = isSystem
              ? 'System watchlists cannot be converted to challenges.'
              : 'Add a goal, a due date, and counting rules.'

            return (
              <FieldLabel htmlFor={field.name}>
                <Field data-disabled={challengeSwitchDisabled} orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Make This a Challenge</FieldTitle>
                    <FieldDescription>{description}</FieldDescription>
                  </FieldContent>
                  <field.SwitchField disabled={challengeSwitchDisabled} />
                </Field>
              </FieldLabel>
            )
          }}
        </form.AppField>

        <ShowIf condition={!isSystem}>
          <form.Subscribe selector={(state) => state.values.challengeEnabled}>
            {(challengeEnabled) => (
              <ShowIf condition={challengeEnabled}>
                <Card size="sm">
                  <CardContent>
                    <WatchlistChallengeFields form={form} isSubmitting={isSubmitting} />
                  </CardContent>
                </Card>
              </ShowIf>
            )}
          </form.Subscribe>
        </ShowIf>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
        <form.AppForm>
          <form.Subscribe selector={(state) => state.values.challengeEnabled}>
            {(challengeEnabled) => {
              const submitLabel = watchlistFormSubmitLabel(mode, challengeEnabled)
              return <form.SubmitButton loadingLabel="Saving…">{submitLabel}</form.SubmitButton>
            }}
          </form.Subscribe>
        </form.AppForm>
      </div>
    </form>
  )
}
