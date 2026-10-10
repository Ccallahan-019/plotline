'use client'

import type { Watchlist } from '@plotline/payload-types'
import type { SubmitEvent } from 'react'

import type { SelectFieldItem } from '@/features/forms/components/SelectField'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field'

import type { EditWatchlistFormApi } from '../hooks/use-edit-watchlist-form'

const WATCHLIST_VISIBILITY_ITEMS: SelectFieldItem<Watchlist['visibility']>[] = [
  { label: 'Private', value: 'private' },
  { label: 'Friends', value: 'friends' },
  { label: 'Public', value: 'public' },
  { label: 'Unlisted', value: 'unlisted' },
]

type EditWatchlistFormProps = {
  form: EditWatchlistFormApi
  isSubmitting: boolean
  onCancel: () => void
}

export function EditWatchlistForm({ form, isSubmitting, onCancel }: EditWatchlistFormProps) {
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void form.handleSubmit()
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
              <FieldLabel htmlFor={field.name}>Visibility</FieldLabel>
              <FieldContent>
                <field.SelectField<Watchlist['visibility']>
                  disabled={isSubmitting}
                  items={WATCHLIST_VISIBILITY_ITEMS}
                />
              </FieldContent>
              <field.FormFieldError />
            </Field>
          )}
        </form.AppField>
      </FieldGroup>

      <DialogFooter>
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
        <form.AppForm>
          <form.SubmitButton loadingLabel="Saving…">Save</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </form>
  )
}
