'use client'

import { createFormHook } from '@tanstack/react-form'

import { SubmitButton } from '../components/SubmitButton'
import { fieldContext, formContext } from '../contexts/form-contexts'

export const { useAppForm, useTypedAppFormContext, withFieldGroup, withForm } = createFormHook({
  fieldComponents: {},
  fieldContext,
  formComponents: {
    SubmitButton,
  },
  formContext,
})

export { useFieldContext, useFormContext } from '../contexts/form-contexts'
