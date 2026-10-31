'use client';

import {
  formatMembershipPeriod,
  MEMBERSHIP_TYPE_LABELS,
  membershipCreateSchema,
  membershipSeasonPeriod,
  type MembershipType,
  membershipTypeEnum,
} from '@yoga-sof/core';
import { useState } from 'react';
import { DatePickerElement } from 'react-hook-form-mui/date-pickers';

import { Form } from '../../components/form/Form';
import type { FieldProps } from '../../components/form/types';
import { AsyncAutocompleteElement } from '../../components/input/AsyncAutocompleteElement';
import { EnumSelectElement } from '../../components/input/EnumSelectElement';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';

type User = RouterOutputs['user']['list']['rows'][number];
type CreatedMembership = RouterOutputs['membership']['create'];

interface MembershipFormValues {
  type: MembershipType;
  year: number | null;
  beneficiaries: User[];
}

const MembershipFields = ({ disabled }: FieldProps) => {
  const settingQuery = api.membershipSetting.get.useQuery();
  const [year, setYear] = useState<number | null>(null);
  const setting = settingQuery.data;
  const period =
    setting && year !== null
      ? membershipSeasonPeriod({ year, month: setting.seasonStartMonth })
      : null;

  return (
    <>
      <EnumSelectElement<MembershipFormValues>
        name="type"
        label="Type d'adhésion"
        values={membershipTypeEnum.enumValues}
        labels={MEMBERSHIP_TYPE_LABELS}
        disabled={disabled}
      />
      <DatePickerElement<MembershipFormValues, 'year', Date>
        name="year"
        label="Année de début de saison"
        views={['year']}
        format="yyyy"
        transform={{
          input: (value) => (value === null ? null : new Date(value, 0, 1)),
          output: (date) => (date === null ? null : date.getFullYear()),
        }}
        onChange={(date) => setYear(date === null ? null : date.getFullYear())}
        rules={{ required: 'Sélectionnez une année.' }}
        helperText={period ? `Période : ${formatMembershipPeriod(period)}` : undefined}
        disabled={disabled}
      />
      <AsyncAutocompleteElement<User, MembershipFormValues, true>
        name="beneficiaries"
        label="Bénéficiaires"
        multiple
        list={api.user.list}
        sort={{ field: 'name', sort: 'asc' }}
        getOptionLabel={(user) => user.name ?? '-'}
        preload
        disabled={disabled}
      />
    </>
  );
};

export const MembershipForm = () => {
  return (
    <Form<CreatedMembership, MembershipFormValues>
      create={api.membership.create}
      schema={membershipCreateSchema}
      defaultValues={() => ({
        type: 'individuelle',
        year: null,
        beneficiaries: [],
      })}
      redirectTo={() => '/adhesions'}
      createdMessage="Adhésion créée."
      cancelHref="/adhesions"
    >
      {MembershipFields}
    </Form>
  );
};
