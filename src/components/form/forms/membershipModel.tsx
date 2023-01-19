import React from 'react';
import { DeepPartial } from 'react-hook-form-mui';
import { z } from 'zod';
import {
  membershipModelCreateSchema,
  membershipModelGetTransformSchema,
  membershipModelUpdateSchema
} from '../../../common/schemas/membershipModel';
import { Grid } from '@mui/material';
import { InputPrice } from '../fields';
import { Groups } from '@mui/icons-material';
import { CreateFormContent, UpdateFormContent } from '../form';
import { MembershipModel } from '@prisma/client';
import { ParsedUrlQuery } from 'querystring';
import { trpc } from '../../../common/trpc';
import { SelectMembershipType } from '../fields/SelectMembershipType';

interface MembershipModelFormFieldsProps {
  update?: boolean;
}

const MembershipModelFormFields: React.FC<MembershipModelFormFieldsProps> = ({ update }) => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <SelectMembershipType name="id" disabled={!!update} />
    </Grid>
    <Grid item xs={12}>
      <InputPrice name="price" label="Prix de l'adhésion en euros" />
    </Grid>
  </Grid>
);

const membershipModelFormDefaultValues: DeepPartial<z.infer<typeof membershipModelCreateSchema>> = {};

const useProceduresToInvalidate = () => {
  const { membershipModel } = trpc.useContext();
  return [membershipModel.find, membershipModel.findAll];
};

const commonFormProps = {
  icon: <Groups />,
  defaultValues: membershipModelFormDefaultValues,
  urlSuccessFor: (data: MembershipModel) => `/administration/adhesions`,
  urlCancel: `/administration/adhesions`,
};

export const MembershipModelCreateForm = () => {
  return (
    <CreateFormContent
      {...commonFormProps}
      title="Création d'un type d'adhésion"
      schema={membershipModelCreateSchema}
      mutationProcedure={trpc.membershipModel.create}
      successMessage={(data) => `Le type d'adhésion a été créé.`}
      invalidate={useProceduresToInvalidate()}
    >
      <MembershipModelFormFields />
    </CreateFormContent>
  );
};

export const MembershipModelUpdateForm = ({ queryData }: { queryData: ParsedUrlQuery }) => {
  return (
    <UpdateFormContent
      {...commonFormProps}
      title="Modification d'un type d'adhésion"
      schema={membershipModelUpdateSchema}
      mutationProcedure={trpc.membershipModel.update}
      queryProcedure={trpc.membershipModel.find}
      querySchema={membershipModelGetTransformSchema}
      queryParams={queryData}
      successMessage={(data) => `Le type d'adhésion a été mis à jour.`}
      invalidate={useProceduresToInvalidate()}
    >
      <MembershipModelFormFields update />
    </UpdateFormContent>
  );
};
