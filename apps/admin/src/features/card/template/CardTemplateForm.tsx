'use client';

import {
  cardTemplateCreateSchema,
  centsToEuros,
  COURSE_TYPE_LABELS,
  type CourseType,
  courseTypeEnum,
} from '@yoga-sof/core';
import { TextFieldElement } from 'react-hook-form-mui';

import { Form } from '../../../components/form/Form';
import type { FieldProps } from '../../../components/form/types';
import { EnumSelectElement } from '../../../components/input/EnumSelectElement';
import { PriceFieldElement } from '../../../components/input/PriceFieldElement';
import { api } from '../../../server/api';
import type { RouterOutputs } from '../../../server/appRouter';

type CardTemplate = NonNullable<RouterOutputs['cardTemplate']['get']>;

interface CardTemplateFormValues {
  type: CourseType;
  price: string;
  count: string;
}

const CardTemplateFields = ({ disabled }: FieldProps) => (
  <>
    <EnumSelectElement<CardTemplateFormValues>
      name="type"
      label="Type de séance"
      values={courseTypeEnum.enumValues}
      labels={COURSE_TYPE_LABELS}
      disabled={disabled}
    />
    <PriceFieldElement<CardTemplateFormValues> name="price" label="Prix (€)" disabled={disabled} />
    <TextFieldElement<CardTemplateFormValues>
      name="count"
      label="Nombre de séances"
      type="number"
      slotProps={{ htmlInput: { min: 1, step: 1 } }}
      disabled={disabled}
    />
  </>
);

export const CardTemplateForm = ({ id }: { id?: number }) => {
  return (
    <Form<CardTemplate, CardTemplateFormValues, typeof cardTemplateCreateSchema>
      id={id}
      get={api.cardTemplate.get}
      create={api.cardTemplate.create}
      update={api.cardTemplate.update}
      schema={cardTemplateCreateSchema}
      defaultValues={(template) => ({
        type: template?.type ?? 'adulte',
        price: template ? String(centsToEuros(template.price)) : '',
        count: template ? String(template.count) : '',
      })}
      redirectTo={() => '/parametres/cartes'}
      createdMessage="Modèle créé."
      updatedMessage="Modèle modifié."
      cancelHref="/parametres/cartes"
    >
      {CardTemplateFields}
    </Form>
  );
};
