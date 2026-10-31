'use client';

import {
  centsToEuros,
  MEMBERSHIP_TYPE_LABELS,
  membershipPriceCreateSchema,
  type MembershipType,
  membershipTypeEnum,
} from '@yoga-sof/core';

import { Form } from '../../../components/form/Form';
import type { FieldProps } from '../../../components/form/types';
import { EnumSelectElement } from '../../../components/input/EnumSelectElement';
import { PriceFieldElement } from '../../../components/input/PriceFieldElement';
import { api } from '../../../server/api';
import type { RouterOutputs } from '../../../server/appRouter';

type MembershipPrice = NonNullable<RouterOutputs['membershipPrice']['get']>;

interface MembershipPriceFormValues {
  type: MembershipType;
  price: string;
}

const MembershipPriceFields = ({ disabled }: FieldProps) => (
  <>
    <EnumSelectElement<MembershipPriceFormValues>
      name="type"
      label="Type d'adhésion"
      values={membershipTypeEnum.enumValues}
      labels={MEMBERSHIP_TYPE_LABELS}
      disabled={disabled}
    />
    <PriceFieldElement<MembershipPriceFormValues>
      name="price"
      label="Prix (€)"
      disabled={disabled}
    />
  </>
);

export const MembershipPriceForm = ({ id }: { id?: number }) => {
  return (
    <Form<MembershipPrice, MembershipPriceFormValues>
      id={id}
      get={api.membershipPrice.get}
      create={api.membershipPrice.create}
      update={api.membershipPrice.update}
      schema={membershipPriceCreateSchema}
      defaultValues={(price) => ({
        type: price?.type ?? 'individuelle',
        price: price ? String(centsToEuros(price.price)) : '',
      })}
      redirectTo={() => '/parametres'}
      createdMessage="Tarif créé."
      updatedMessage="Tarif modifié."
      cancelHref="/parametres"
    >
      {MembershipPriceFields}
    </Form>
  );
};
