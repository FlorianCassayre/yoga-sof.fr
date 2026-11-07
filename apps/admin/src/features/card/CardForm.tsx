'use client';

import {
  cardCreateSchema,
  cardValidUntil,
  COURSE_TYPE_LABELS,
  courseTypeEnum,
  formatPrice,
} from '@yoga-sof/core';

import { Form } from '../../components/form/Form';
import type { FieldProps } from '../../components/form/types';
import { AsyncAutocompleteElement } from '../../components/input/AsyncAutocompleteElement';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { formatValidUntil } from './formatValidUntil';

type User = RouterOutputs['user']['list']['rows'][number];
type CardTemplate = RouterOutputs['cardTemplate']['list']['rows'][number];
type CreatedCard = RouterOutputs['card']['create'];

interface CardFormValues {
  holder: User | null;
  template: CardTemplate | null;
}

const CardFields = ({ disabled }: FieldProps) => {
  const settingQuery = api.cardSetting.get.useQuery();
  const setting = settingQuery.data;
  const validUntil = setting
    ? formatValidUntil(cardValidUntil({ purchasedAt: new Date(), months: setting.validityMonths }))
    : null;

  return (
    <>
      <AsyncAutocompleteElement<User, CardFormValues>
        name="holder"
        label="Titulaire"
        list={api.user.list}
        sort={{ field: 'name', sort: 'asc' }}
        getOptionLabel={(user) => user.name ?? '-'}
        preload
        disabled={disabled}
      />
      <AsyncAutocompleteElement<CardTemplate, CardFormValues>
        name="template"
        label="Modèle de carte"
        list={api.cardTemplate.list}
        sort={{ field: 'type', sort: 'asc' }}
        getOptionLabel={(template) =>
          `${template.count} ${template.count > 1 ? 'séances' : 'séance'} ${
            COURSE_TYPE_LABELS[template.type]
          } (${formatPrice(template.price)})`
        }
        compareOptions={(a, b) =>
          courseTypeEnum.enumValues.indexOf(a.type) - courseTypeEnum.enumValues.indexOf(b.type) ||
          a.count - b.count
        }
        preload
        helperText={validUntil ? `Valable jusqu'au ${validUntil}` : undefined}
        disabled={disabled}
      />
    </>
  );
};

export const CardForm = () => {
  return (
    <Form<CreatedCard, CardFormValues, typeof cardCreateSchema>
      create={api.card.create}
      schema={cardCreateSchema}
      defaultValues={() => ({ holder: null, template: null })}
      redirectTo={(card) => `/cartes/${card.id}`}
      createdMessage="Carte créée."
      cancelHref="/cartes"
    >
      {CardFields}
    </Form>
  );
};
