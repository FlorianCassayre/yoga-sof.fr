import React, { useCallback } from 'react';
import { z } from 'zod';
import { DeepPartial, FormContainer } from 'react-hook-form-mui';
import { inferHandlerInput, inferProcedureInput, inferProcedureOutput, ProcedureRecord } from '@trpc/server';
import { AppRouter } from '../../lib/server/controllers';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Grid } from '@mui/material';
import { AddBox, Cancel, Save } from '@mui/icons-material';
import { trpc } from '../../lib/common/trpc';
import { useRouter } from 'next/router';
import { BackofficeContent } from '../layout/admin/BackofficeContent';

type inferProcedures<TObj extends ProcedureRecord> = {
  [TPath in keyof TObj]: {
    input: inferProcedureInput<TObj[TPath]>;
    output: inferProcedureOutput<TObj[TPath]>;
  };
};

type Mutations = inferProcedures<AppRouter["_def"]["mutations"]>;
type MutationKey = keyof Mutations;

type Queries = inferProcedures<AppRouter["_def"]["queries"]>;
type QueryKey = keyof Queries;

interface FormContentProps<TMutationPath extends MutationKey, TData> {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
  schema: z.ZodType<Mutations[TMutationPath]['input']>;
  urlSuccessFor: (data: TData) => string;
  urlCancel: string;
  mutation: TMutationPath;
  defaultValues: DeepPartial<Mutations[TMutationPath]['input']>;
}

interface CreateFormContentProps<TMutationPath extends MutationKey> extends FormContentProps<TMutationPath, Mutations[TMutationPath]['output']> {

}

interface UpdateFormContentProps<TQueryPath extends QueryKey, TMutationPath extends MutationKey> extends FormContentProps<TMutationPath, Queries[TQueryPath]['output'] | Mutations[TMutationPath]['output']> {
  query: TQueryPath;
  queryData: inferHandlerInput<AppRouter["_def"]["queries"][TQueryPath]>;
}

interface InternalFormContentProps<TMutationPath extends MutationKey, TData> extends FormContentProps<TMutationPath, TData> {
  edit: boolean;
  isLoading: boolean;
}

const InternalFormContent = <TMutationPath extends MutationKey>({
  children,
  title,
  icon,
  schema,
  urlSuccessFor,
  urlCancel,
  mutation,
  defaultValues,
  edit,
  isLoading: isQueryLoading,
}: InternalFormContentProps<TMutationPath, Mutations[TMutationPath]['output']>) => {
  const router = useRouter();

  const { mutate, isLoading, isError } = trpc.useMutation(mutation, {
    onSuccess: (data) => {
      // TODO: once it succeeds, fallback to forever loading state
      return router.push(urlSuccessFor(data));
    },
  });

  const handleSubmit = useCallback((data: Mutations[TMutationPath]['input']) => {
    mutate(data);
  }, []);

  const handleCancel = useCallback(() => {
    return router.push(urlCancel);
  }, []);

  return !isQueryLoading ? (
    <BackofficeContent
      title={title}
      icon={icon}
    >
      <FormContainer onSuccess={handleSubmit} resolver={zodResolver(schema)} defaultValues={defaultValues}>
        {!isLoading ? (
          <Grid container spacing={2}>
            {isError && (
              <Grid item xs={12} sx={{ mb: 2 }}>
                <Alert severity="error">Une erreur est survenue.</Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              {children}
            </Grid>
            <Grid item xs={12} container direction="row" spacing={2} justifyContent="flex-end">
              <Grid item>
                <Button variant="outlined" color="inherit" startIcon={<Cancel />} onClick={handleCancel}>Annuler</Button>
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained" color={edit ? undefined : 'success'} startIcon={edit ? <Save /> : <AddBox />}>
                  {edit ? 'Sauvegarder' : 'Créer'}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          'mutation loading...'
        )}
      </FormContainer>
    </BackofficeContent>
  ) : (
    <>
      query loading
    </>
  );
}

export const CreateFormContent = <TMutationPath extends MutationKey>({ children, ...props }: CreateFormContentProps<TMutationPath>): JSX.Element => {
  return (
    <InternalFormContent
      {...props}
      edit={false}
      isLoading={false}
    >
      {children}
    </InternalFormContent>
  );
};

export const UpdateFormContent = <TQueryPath extends QueryKey, TMutationPath extends MutationKey>({
  children,
  defaultValues,
  query,
  queryData,
  ...props
}: UpdateFormContentProps<TQueryPath, TMutationPath>): JSX.Element => {
  const { data, isLoading, isError } = trpc.useQuery([query, ...queryData]);
  // TODO error
  return (
    <InternalFormContent
      {...props}
      edit={true}
      isLoading={isLoading}
      defaultValues={{ ...defaultValues, data }}
    >
      {children}
    </InternalFormContent>
  );
};
