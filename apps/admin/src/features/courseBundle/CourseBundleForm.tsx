'use client';

import { centsToEuros } from '@yoga-sof/core';
import { TextFieldElement } from 'react-hook-form-mui';

import { Form } from '../../components/form/Form';
import type { FieldProps } from '../../components/form/types';
import { PriceFieldElement } from '../../components/input/PriceFieldElement';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';

type CourseBundle = NonNullable<RouterOutputs['courseBundle']['get']>;

interface CourseBundleFormValues {
  label: string;
  price: string;
  capacity: string;
}

const CourseBundleFields = ({ disabled }: FieldProps) => (
  <>
    <TextFieldElement<CourseBundleFormValues>
      name="label"
      label="Libellé"
      disabled={disabled}
      rules={{ required: 'Le libellé est requis.' }}
    />
    <PriceFieldElement<CourseBundleFormValues> name="price" label="Prix (€)" disabled={disabled} />
    <TextFieldElement<CourseBundleFormValues>
      name="capacity"
      label="Capacité"
      type="number"
      disabled={disabled}
      rules={{ required: 'La capacité est requise.' }}
    />
  </>
);

export const CourseBundleForm = ({ id }: { id: number }) => {
  return (
    <Form<CourseBundle, CourseBundleFormValues>
      id={id}
      get={api.courseBundle.get}
      update={api.courseBundle.update}
      defaultValues={(bundle) => ({
        label: bundle?.label ?? '',
        price: bundle ? String(centsToEuros(bundle.price)) : '',
        capacity: bundle ? String(bundle.capacity) : '',
      })}
      redirectTo={(bundle) => `/lots/${bundle.id}`}
      createdMessage="Lot de séances créé."
      updatedMessage="Lot de séances modifié."
      cancelHref={`/lots/${id}`}
    >
      {CourseBundleFields}
    </Form>
  );
};
