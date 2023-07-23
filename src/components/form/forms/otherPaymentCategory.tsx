import React from 'react';
import { DeepPartial, TextFieldElement } from 'react-hook-form-mui';
import { z } from 'zod';
import {
} from '../../../common/schemas';
import { Grid } from '@mui/material';
import { Folder } from '@mui/icons-material';
import { CreateFormContent, UpdateFormContent } from '../form';
import { ParsedUrlQuery } from 'querystring';
import { OtherPaymentCategory } from '@prisma/client';
import {
  otherPaymentCategoryCreateSchema,
  otherPaymentCategoryFindTransformSchema,
  otherPaymentCategoryUpdateSchema,
} from '../../../common/schemas/otherPaymentCategory';
import { trpc } from '../../../common/trpc';

const OtherPaymentCategoryFormFields = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextFieldElement name="name" label="Intitulé" fullWidth />
      </Grid>
    </Grid>
  );
}

const otherPaymentCategoryFormDefaultValues: DeepPartial<z.infer<typeof otherPaymentCategoryCreateSchema>> = {
  name: '',
};

const useProceduresToInvalidate = () => {
  const { otherPaymentCategory, otherPayment } = trpc.useContext();
  return [otherPaymentCategory.find, otherPaymentCategory.findAll, otherPayment.find, otherPayment.findUpdate, otherPayment.findAll];
};

const commonFormProps = {
  icon: <Folder />,
  defaultValues: otherPaymentCategoryFormDefaultValues,
  urlSuccessFor: (data: OtherPaymentCategory) => `/administration/transactions`,
  urlCancel: `/administration/transactions`,
};

export const OtherPaymentCategoryCreateForm = () => {
  return (
    <CreateFormContent
      {...commonFormProps}
      title="Création d'une catégorie de transaction"
      schema={otherPaymentCategoryCreateSchema}
      mutationProcedure={trpc.otherPaymentCategory.create}
      successMessage={(data) => `La catégorie de transaction a été créée.`}
      invalidate={useProceduresToInvalidate()}
    >
      <OtherPaymentCategoryFormFields />
    </CreateFormContent>
  );
};

export const OtherPaymentCategoryUpdateForm = ({ queryParams }: { queryParams: ParsedUrlQuery }) => {
  return (
    <UpdateFormContent
      {...commonFormProps}
      title="Modification d'une catégorie de transaction"
      schema={otherPaymentCategoryUpdateSchema}
      mutationProcedure={trpc.otherPaymentCategory.update}
      queryProcedure={trpc.otherPaymentCategory.find}
      querySchema={otherPaymentCategoryFindTransformSchema}
      queryParams={queryParams}
      successMessage={(data) => `La catégorie de transaction a été mise à jour.`}
      invalidate={useProceduresToInvalidate()}
    >
      <OtherPaymentCategoryFormFields />
    </UpdateFormContent>
  );
};
