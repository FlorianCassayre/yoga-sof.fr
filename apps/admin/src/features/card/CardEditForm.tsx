'use client';

import { DatePickerElement } from 'react-hook-form-mui/date-pickers';

import { Form } from '../../components/form/Form';
import type { FieldProps } from '../../components/form/types';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';

type Card = RouterOutputs['card']['update'];

interface CardEditFormValues {
  validUntil: string;
}

const toDateInput = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const CardEditFields = ({ disabled }: FieldProps) => (
  <DatePickerElement<CardEditFormValues, 'validUntil', Date>
    name="validUntil"
    label="Valable jusqu'au"
    transform={{
      input: (value) => (value === null ? null : new Date(`${value}T12:00:00Z`)),
      output: (date) => (date === null ? '' : toDateInput(date)),
    }}
    rules={{ required: 'Sélectionnez une date.' }}
    disabled={disabled}
  />
);

export const CardEditForm = ({ id }: { id: number }) => {
  return (
    <Form<Card, CardEditFormValues>
      id={id}
      get={api.card.get}
      update={api.card.update}

      defaultValues={(card) => ({ validUntil: card?.validUntil ?? '' })}
      redirectTo={(card) => `/cartes/${card.id}`}
      createdMessage="Carte créée."
      updatedMessage="Carte modifiée."
      cancelHref={`/cartes/${id}`}
    >
      {CardEditFields}
    </Form>
  );
};
