import React from 'react';
import { DatePickerElement, DeepPartial, TextFieldElement } from 'react-hook-form-mui';
import { z } from 'zod';
import {
  transactionCreateSchema, transactionGetTransformSchema, transactionUpdateSchema
} from '../../../common/schemas/transaction';
import { Grid } from '@mui/material';
import { InputPrice } from '../fields';
import { Payments } from '@mui/icons-material';
import { CreateFormContent, UpdateFormContent } from '../form';
import { Transaction } from '@prisma/client';
import { trpc } from '../../../common/trpc';
import { SelectTransactionType } from '../fields/SelectTransactionType';
import { SelectUser } from '../fields/SelectUser';
import { ParsedUrlQuery } from 'querystring';

const TransactionFormFields = () => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <SelectUser name="userId" />
    </Grid>
    <Grid item xs={12} sm={6}>
      <InputPrice name="amount" label="Montant en euros" />
    </Grid>
    <Grid item xs={12} sm={6}>
      <SelectTransactionType name="type" />
    </Grid>
    <Grid item xs={12}>
      <DatePickerElement name="date" label="Date" inputProps={{ fullWidth: true }} />
    </Grid>
    <Grid item xs={12}>
      <TextFieldElement name="comment" label="Commentaires éventuels" fullWidth />
    </Grid>
  </Grid>
);

const transactionFormDefaultValues = (): DeepPartial<z.infer<typeof transactionCreateSchema>> => ({
  date: new Date(),
});

const useProceduresToInvalidate = () => {
  const { transaction } = trpc.useContext();
  return [transaction.find, transaction.findAll];
};

const commonFormProps = () => ({
  icon: <Payments />,
  defaultValues: transactionFormDefaultValues(),
  urlSuccessFor: (data: Transaction) => `/administration/paiements`,
  urlCancel: `/administration/paiements`,
});

export const TransactionCreateForm = () => {
  return (
    <CreateFormContent
      {...commonFormProps()}
      title="Enregistrement d'un paiement perçu"
      schema={transactionCreateSchema}
      mutationProcedure={trpc.transaction.create}
      successMessage={(data) => `Le paiement a été enregistré.`}
      invalidate={useProceduresToInvalidate()}
    >
      <TransactionFormFields />
    </CreateFormContent>
  );
};

interface TransactionUpdateFormProps {
  queryData: ParsedUrlQuery;
}

export const TransactionUpdateForm: React.FC<TransactionUpdateFormProps> = ({ queryData }) => {
  return (
    <UpdateFormContent
      {...commonFormProps()}
      title="Modification d'un paiement perçu"
      schema={transactionUpdateSchema}
      mutationProcedure={trpc.transaction.update}
      queryProcedure={trpc.transaction.find}
      querySchema={transactionGetTransformSchema}
      queryParams={queryData}
      successMessage={(data) => `Le paiement a été enregistré.`}
      invalidate={useProceduresToInvalidate()}
    >
      <TransactionFormFields />
    </UpdateFormContent>
  );
};
