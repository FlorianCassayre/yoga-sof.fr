'use client';

import type { FieldValues } from 'react-hook-form';

import { FormFields } from './FormFields';
import { FormLoader } from './FormLoader';
import type { FormProps, IdVersion } from './types';

export const Form = <Row extends IdVersion, Values extends FieldValues>({
  id,
  get,
  create,
  update,
  defaultValues,
  redirectTo,
  createdMessage,
  updatedMessage,
  cancelHref,
  children,
}: FormProps<Row, Values>) => {
  const commonProps = {
    create,
    update,
    defaultValues,
    redirectTo,
    createdMessage,
    updatedMessage,
    cancelHref,
    children,
  };

  return id == null ? (
    <FormFields<Row, Values> row={undefined} {...commonProps} />
  ) : (
    <FormLoader<Row, Values> id={id} get={get} {...commonProps} />
  );
};
