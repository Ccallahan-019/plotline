'use client'

import { createFormHook } from '@tanstack/react-form'

import { CheckboxField } from '../components/CheckboxField'
import { DateField } from '../components/DateField'
import { FormFieldError } from '../components/FormFieldError'
import { NumberField } from '../components/NumberField'
import { SelectField } from '../components/SelectField'
import { SubmitButton } from '../components/SubmitButton'
import { TextField } from '../components/TextField'
import { ToggleGroupField } from '../components/ToggleGroupField'
import { fieldContext, formContext } from '../contexts/form-contexts'

export const { useAppForm, useTypedAppFormContext, withFieldGroup, withForm } = createFormHook({
  fieldComponents: {
    CheckboxField,
    DateField,
    FormFieldError,
    NumberField,
    SelectField,
    TextField,
    ToggleGroupField,
  },
  fieldContext,
  formComponents: {
    SubmitButton,
  },
  formContext,
})
