'use client';

import type { FieldValues } from 'react-hook-form';

import { FormFields } from './FormFields';
import { FormLoader } from './FormLoader';
import type { FormProps } from './types';

export const Form = <Row, Values extends FieldValues>({
  id,
  get,
  create,
  update,
  schema,
  defaultValues,
  redirectTo,
  createdMessage,
  updatedMessage,
  submitLabel,
  cancelHref,
  children,
}: FormProps<Row, Values>) => {
  const commonProps = {
    create,
    update,
    schema,
    defaultValues,
    redirectTo,
    createdMessage,
    updatedMessage,
    submitLabel,
    cancelHref,
    children,
  };

  return id != null && get ? (
    <FormLoader<Row, Values> id={id} get={get} {...commonProps} />
  ) : (
    <FormFields<Row, Values> row={undefined} {...commonProps} />
  );
};
