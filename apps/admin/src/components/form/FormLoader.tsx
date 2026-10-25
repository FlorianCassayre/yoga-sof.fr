'use client';

import { notFound } from 'next/navigation';
import type { FieldValues } from 'react-hook-form';

import { isNotFoundError } from '../../server/isNotFoundError';
import { FormFields } from './FormFields';
import type { FormProps, IdVersion } from './types';

type FormLoaderProps<Row extends IdVersion, Values extends FieldValues> = Omit<
  FormProps<Row, Values>,
  'id'
> & { id: number };

export const FormLoader = <Row extends IdVersion, Values extends FieldValues>({
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
      defaultValues={defaultValues}
      redirectTo={redirectTo}
      createdMessage={createdMessage}
      updatedMessage={updatedMessage}
      cancelHref={cancelHref}
    >
      {children}
    </FormFields>
  );
};
