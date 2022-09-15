import React, { useCallback } from 'react';
import { z } from 'zod';
import { DeepPartial, FormContainer, useFormState } from 'react-hook-form-mui';
import { MutationKey, Mutations, QueryKey, Queries, AppRouter } from '../../lib/server/controllers';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, CircularProgress, Grid } from '@mui/material';
import { AddBox, Cancel, Save } from '@mui/icons-material';
import { trpc } from '../../lib/common/trpc';
import { useRouter } from 'next/router';
import { BackofficeContent } from '../layout/admin/BackofficeContent';
import { ParsedUrlQuery } from 'querystring';
import { ZodTypeDef } from 'zod/lib/types';
import { SnackbarMessage, useSnackbar } from 'notistack';
import { TRPCClientErrorLike } from '@trpc/client';

interface FormErrorAlertItemProps {
  serverError: TRPCClientErrorLike<AppRouter> | null;
}

const FormErrorAlertItem: React.FC<FormErrorAlertItemProps> = ({ serverError }) => {
  const { errors: clientErrors } = useFormState();

  if (!serverError /*&& !clientErrors*/) {
    return null;
  }
  // TODO

  return (
    <Grid item xs={12}>
      <Alert severity="error">
        {serverError ? (!!serverError.data && ('code' in serverError.data ?
          serverError.message : 'zodError' in serverError.data ? 'Certains champs ne sont pas correctement remplis' : null)) ?? 'Une erreur est survenue' : (
          'Certains champs ne sont pas correctement remplis'
        )}
      </Alert>
    </Grid>
  );
};

interface FormContentProps<TMutationPath extends MutationKey, TData> {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
  schema: z.ZodType<Mutations[TMutationPath]['input']>;
  urlSuccessFor: (data: TData) => string;
  urlCancel: string;
  mutation: TMutationPath;
  defaultValues: DeepPartial<Mutations[TMutationPath]['input']>;
  invalidate?: QueryKey[];
  successMessage: (data: TData) => SnackbarMessage;
}

interface CreateFormContentProps<TMutationPath extends MutationKey> extends FormContentProps<TMutationPath, Mutations[TMutationPath]['output']> {

}

interface UpdateFormContentProps<TQueryPath extends QueryKey, TMutationPath extends MutationKey, TQueryInputSchema extends z.ZodType<Queries[TQueryPath]['input'], ZodTypeDef, any>> extends FormContentProps<TMutationPath, Mutations[TMutationPath]['output']> {
  query: TQueryPath;
  querySchema: TQueryInputSchema;
  queryParams: ParsedUrlQuery;
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
  invalidate,
  successMessage,
  edit,
  isLoading: isQueryLoading,
}: InternalFormContentProps<TMutationPath, Mutations[TMutationPath]['output']>) => {
  const router = useRouter();
  const { queryClient } = trpc.useContext();

  const { enqueueSnackbar } = useSnackbar();

  const { mutate, isLoading, error } = trpc.useMutation(mutation, {
    onSuccess: (data) => {
      const invalidations = invalidate ? invalidate.map(query => queryClient.resetQueries(query)) : [];
      return Promise.all([router.push(urlSuccessFor(data)), ...invalidations])
        .then(() => enqueueSnackbar(successMessage(data), { variant: 'success' }));
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
            <FormErrorAlertItem serverError={error} />
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
          <Box display="flex" alignItems="center" justifyContent="center">
            <CircularProgress sx={{ mt: 5 }} />
          </Box>
        )}
      </FormContainer>
    </BackofficeContent>
  ) : ( // TODO skeleton here
    <Box display="flex" alignItems="center" justifyContent="center">
      <CircularProgress sx={{ mt: 10 }} />
    </Box>
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

export const UpdateFormContent = <TQueryPath extends QueryKey, TMutationPath extends MutationKey, TQueryInputSchema extends z.ZodType<Queries[TQueryPath]['input'], ZodTypeDef, any>>({
  children,
  defaultValues,
  query,
  querySchema,
  queryParams,
  ...props
}: UpdateFormContentProps<TQueryPath, TMutationPath, TQueryInputSchema>): JSX.Element => {
  const parsed = querySchema.parse(queryParams); // TODO error handling
  const { data, isLoading, isError } = trpc.useQuery([query, parsed] as any); // Sadly...
  // TODO error
  return (
    <InternalFormContent
      {...props}
      edit={true}
      isLoading={isLoading}
      defaultValues={{ ...defaultValues, ...data }}
    >
      {children}
    </InternalFormContent>
  );
};
