'use client'

import { Button } from '@/components/ui/button'

import { useFormContext } from '../contexts/form-contexts'

type SubmitButtonProps = {
  isPending?: boolean
  loadingLabel?: React.ReactNode
} & React.ComponentProps<typeof Button>

export function SubmitButton({
  children,
  className,
  disabled,
  isPending = false,
  loadingLabel,
  ...props
}: SubmitButtonProps) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => {
        const pending = isSubmitting || isPending

        return (
          <Button className={className} disabled={disabled || pending} type="submit" {...props}>
            {pending && loadingLabel != null ? loadingLabel : children}
          </Button>
        )
      }}
    </form.Subscribe>
  )
}
