import React from 'react';
import {
  DatePickerElement,
  DeepPartial,
  TextFieldElement,
} from 'react-hook-form-mui';
import { z } from 'zod';
import {
} from '../../../common/schemas';
import { Alert, Grid } from '@mui/material';
import { SwapHoriz } from '@mui/icons-material';
import { CreateFormContent, UpdateFormContent } from '../form';
import { ParsedUrlQuery } from 'querystring';
import { OtherPayment } from '@prisma/client';
import {
  otherPaymentCreateSchema,
  otherPaymentFindTransformSchema,
  otherPaymentUpdateSchema,
} from '../../../common/schemas/otherPayment';
import { trpc } from '../../../common/trpc';
import { SelectOtherPaymentCategory } from '../fields/SelectOtherPaymentCategory';
import { SelectPaymentRecipient } from '../fields/SelectPaymentRecipient';
import { InputPrice } from '../fields';
import { SelectTransactionType } from '../fields/SelectTransactionType';

const OtherPaymentFormFields = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="info">
          Un montant <u>positif</u> correspond à une <strong>recette</strong>, tandis qu'un montant <u>négatif</u> correspond à une <strong>dépense</strong>.
        </Alert>
      </Grid>
      <Grid item xs={12} sm={6}>
        <SelectOtherPaymentCategory name="category" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextFieldElement name="description" label="Motif" fullWidth />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextFieldElement name="provider" label="Client" fullWidth />
      </Grid>
      <Grid item xs={12} sm={6}>
       <SelectPaymentRecipient name="recipient" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <InputPrice name="amount" label="Montant" allowNegative />
      </Grid>
      <Grid item xs={12} sm={6}>
        <SelectTransactionType name="type" />
      </Grid>
      <Grid item xs={12}>
        <DatePickerElement name="date" label="Date" inputProps={{ fullWidth: true }} />
      </Grid>
    </Grid>
  );
}

const otherPaymentFormDefaultValues = (): DeepPartial<z.infer<typeof otherPaymentCreateSchema>> => ({
  date: new Date(),
});

const useProceduresToInvalidate = () => {
  const { otherPayment, otherPaymentCategory } = trpc.useContext();
  return [otherPayment.find, otherPayment.findUpdate, otherPayment.findAll, otherPaymentCategory.findAll];
};

const commonFormProps = () => ({
  icon: <SwapHoriz />,
  defaultValues: otherPaymentFormDefaultValues(),
  urlSuccessFor: (data: OtherPayment) => `/administration/transactions`,
  urlCancel: `/administration/transactions`,
});

export const OtherPaymentCreateForm = () => {
  return (
    <CreateFormContent
      {...commonFormProps()}
      title="Création d'une transaction"
      schema={otherPaymentCreateSchema}
      mutationProcedure={trpc.otherPayment.create}
      successMessage={(data) => `La transaction a été créée.`}
      invalidate={useProceduresToInvalidate()}
    >
      <OtherPaymentFormFields />
    </CreateFormContent>
  );
};

export const OtherPaymentUpdateForm = ({ queryParams }: { queryParams: ParsedUrlQuery }) => {
  return (
    <UpdateFormContent
      {...commonFormProps()}
      title="Modification d'une transaction"
      schema={otherPaymentUpdateSchema}
      mutationProcedure={trpc.otherPayment.update}
      queryProcedure={trpc.otherPayment.findUpdate}
      querySchema={otherPaymentFindTransformSchema}
      queryParams={queryParams}
      successMessage={(data) => `La transaction a été mise à jour.`}
      invalidate={useProceduresToInvalidate()}
    >
      <OtherPaymentFormFields />
    </UpdateFormContent>
  );
};
