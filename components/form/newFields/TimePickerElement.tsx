import React from 'react';

import {Control, Controller, ControllerProps, FieldError, Path} from 'react-hook-form'
import {TextField, TextFieldProps} from '@mui/material'
import {FieldValues} from 'react-hook-form/dist/types/fields'
import { TimePicker, TimePickerProps } from '@mui/x-date-pickers';
import { colonTimeToParts, formatTimeHHhMM } from '../../../lib/common/newDate';

// Most of this file was adapted from
// https://github.com/dohomi/react-hook-form-mui/blob/master/packages/rhf-mui/src/DateTimePickerElement.tsx

export type TimePickerElementProps<T extends FieldValues, TInputTime, TTime = TInputTime> =
  Omit<TimePickerProps<TInputTime, TTime>,
    'value' | 'onChange' | 'renderInput'>
  & {
  name: Path<T>
  required?: boolean
  parseError?: (error: FieldError) => string
  onChange?: (value: TTime, keyboardInputValue?: string) => void
  validation?: ControllerProps['rules']
  parseTime?: (value: TTime, keyboardInputValue?: string) => TTime
  control?: Control<T>
  inputProps?: TextFieldProps
  helperText?: TextFieldProps['helperText']
}

export function TimePickerElement<TFieldValues extends FieldValues>({
  parseError,
  name,
  required,
  parseTime,
  validation = {},
  inputProps,
  control,
  ...rest
}: TimePickerElementProps<TFieldValues, any, any>): JSX.Element {

  if (required && !validation.required) {
    validation.required = 'This field is required'
  }

  const colonTimeToDate = (time: string | undefined): Date | undefined => {
    if (!time) {
      return undefined;
    }
    const [hours, minutes] = colonTimeToParts(time);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  return (
    <Controller
      name={name}
      rules={validation}
      control={control}
      render={({
        field: {onChange, value},
        fieldState: {error, invalid}
      }) => (
        <TimePicker
          {...rest}
          value={colonTimeToDate(value) || ''}
          onChange={(value, keyboardInputValue) => {
            let newValue: string | undefined = undefined
            if (keyboardInputValue) {
              if (typeof parseTime === 'function') {
                newValue = parseTime(value, keyboardInputValue)
              } else {
                newValue = keyboardInputValue
              }
            } else {
              if (typeof parseTime === 'function') {
                newValue = parseTime(value)
              } else {
                newValue = value
              }
            }
            const newValueString = newValue ? formatTimeHHhMM(newValue as any as Date) : undefined;
            onChange(newValueString, keyboardInputValue)
            if (typeof rest.onChange === 'function') {
              rest.onChange(newValue, keyboardInputValue)
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              inputProps={{
                ...params?.inputProps,
                ...(!value && {
                  value: ''
                })
              }}
              {...inputProps}
              required={!!required}
              error={invalid}
              helperText={
                error
                  ? typeof parseError === 'function'
                    ? parseError(error)
                    : error.message
                  : inputProps?.helperText || rest.helperText
              }
              // Custom
              InputLabelProps={{ required }}
              sx={{ ...params?.sx as any, ...inputProps?.sx as any, width: '100%' }}
            />
          )}
          // Custom
          ampm={false}
          inputFormat="HH:mm"
        />
      )}
    />
  )
}
