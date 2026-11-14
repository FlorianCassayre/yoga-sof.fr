'use client';

import {
  centsToEuros,
  COURSE_TYPE_LABELS,
  courseBundleCreateSchema,
  type CourseType,
  courseTypeEnum,
} from '@yoga-sof/core';
import { TextFieldElement } from 'react-hook-form-mui';

import { Form } from '../../components/form/Form';
import type { FieldProps } from '../../components/form/types';
import { EnumSelectElement } from '../../components/input/EnumSelectElement';
import { PriceFieldElement } from '../../components/input/PriceFieldElement';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';

type CourseBundle = NonNullable<RouterOutputs['courseBundle']['get']>;

interface CourseBundleFormValues {
  label: string;
  type: CourseType;
  price: string;
  capacity: string;
}

const CourseBundleFields = ({ disabled }: FieldProps) => (
  <>
    <TextFieldElement<CourseBundleFormValues> name="label" label="Libellé" disabled={disabled} />
    <EnumSelectElement<CourseBundleFormValues>
      name="type"
      label="Type"
      values={courseTypeEnum.enumValues}
      labels={COURSE_TYPE_LABELS}
      disabled={disabled}
    />
    <PriceFieldElement<CourseBundleFormValues> name="price" label="Prix (€)" disabled={disabled} />
    <TextFieldElement<CourseBundleFormValues>
      name="capacity"
      label="Capacité"
      type="number"
      disabled={disabled}
    />
  </>
);

export const CourseBundleForm = ({ id }: { id?: number }) => {
  return (
    <Form<CourseBundle, CourseBundleFormValues, typeof courseBundleCreateSchema>
      id={id}
      get={api.courseBundle.get}
      create={api.courseBundle.create}
      update={api.courseBundle.update}
      schema={courseBundleCreateSchema}
      defaultValues={(bundle) => ({
        label: bundle?.label ?? '',
        type: bundle?.type ?? 'enfant',
        price: bundle ? String(centsToEuros(bundle.price)) : '',
        capacity: bundle ? String(bundle.capacity) : '',
      })}
      redirectTo={(bundle) => `/lots/${bundle.id}`}
      createdMessage="Lot de séances créé."
      updatedMessage="Lot de séances modifié."
      cancelHref={id === undefined ? '/lots' : `/lots/${id}`}
    >
      {CourseBundleFields}
    </Form>
  );
};
