import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'

import { LogWatchFormApi } from '../../../hooks/use-log-watch-form'
import { LogWatchPlatformField } from './LogWatchPlatformField'
import { PlatformOtherField } from './PlatformOtherField'

type LogWatchPlatformFieldsProps = {
  disabled?: boolean
  form: LogWatchFormApi
  layout?: 'compact' | 'expanded'
}

export function LogWatchPlatformFields({
  disabled = false,
  form,
  layout = 'compact',
}: LogWatchPlatformFieldsProps) {
  return (
    <FieldSet>
      <FieldLegend>Platform</FieldLegend>
      <FieldGroup>
        <LogWatchPlatformField disabled={disabled} form={form} layout={layout} />

        <form.Subscribe selector={(state) => state.values.platform === 'other'}>
          {(isOther) => (
            <ShowIf condition={isOther}>
              <PlatformOtherField disabled={disabled} form={form} />
            </ShowIf>
          )}
        </form.Subscribe>
      </FieldGroup>
    </FieldSet>
  )
}
