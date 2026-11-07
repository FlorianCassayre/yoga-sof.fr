'use client';

import { Form } from '../../components/form/Form';
import type { FieldProps } from '../../components/form/types';
import { AsyncAutocompleteElement } from '../../components/input/AsyncAutocompleteElement';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';

type Membership = RouterOutputs['membership']['update'];
type Beneficiary = Membership['beneficiaries'][number];

interface MembershipEditFormValues {
  beneficiaries: Beneficiary[];
}

const MembershipEditFields = ({ disabled }: FieldProps) => (
  <AsyncAutocompleteElement<Beneficiary, MembershipEditFormValues, true>
    name="beneficiaries"
    label="Bénéficiaires"
    multiple
    list={api.user.list}
    sort={{ field: 'name', sort: 'asc' }}
    getOptionLabel={(beneficiary) => beneficiary.name ?? '-'}
    preload
    rules={{ required: 'Sélectionnez au moins un bénéficiaire.' }}
    disabled={disabled}
  />
);

export const MembershipEditForm = ({ id }: { id: number }) => {
  return (
    <Form<Membership, MembershipEditFormValues>
      id={id}
      get={api.membership.get}
      update={api.membership.update}
      defaultValues={(membership) => ({ beneficiaries: membership?.beneficiaries ?? [] })}
      redirectTo={(membership) => `/adhesions/${membership.id}`}
      createdMessage="Adhésion créée."
      updatedMessage="Adhésion modifiée."
      cancelHref={`/adhesions/${id}`}
    >
      {MembershipEditFields}
    </Form>
  );
};
