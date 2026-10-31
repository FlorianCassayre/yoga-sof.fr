'use client';

import { notFound } from 'next/navigation';
import type { FieldValues } from 'react-hook-form';

import { isNotFoundError } from '../../server/isNotFoundError';
import { FormFields } from './FormFields';
import type { FormProps, GetProcedure } from './types';

type FormLoaderProps<Row, Values extends FieldValues> = Omit<
  FormProps<Row, Values>,
  'id' | 'get'
> & {
  id: number;
  get: GetProcedure<Row>;
};

export const FormLoader = <Row, Values extends FieldValues>({
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
}: FormLoaderProps<Row, Values>) => {
  const query = get.useQuery({ id });

  if (query.isPending) {
    return null;
  }

  if (isNotFoundError(query.error)) {
    notFound();
  }

  if (!query.data) {
    return null;
  }

  return (
    <FormFields<Row, Values>
      row={query.data}
      create={create}
      update={update}
      schema={schema}
      defaultValues={defaultValues}
      redirectTo={redirectTo}
      createdMessage={createdMessage}
      updatedMessage={updatedMessage}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
    >
      {children}
    </FormFields>
  );
};
