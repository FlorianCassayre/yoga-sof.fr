import React, { useCallback, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { DeepPartial, FormContainer, useFormState } from 'react-hook-form-mui';
import { AppRouter } from '../../server/controllers';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, CircularProgress, Grid } from '@mui/material';
import { AddBox, Cancel, Save } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { BackofficeContent } from '../layout/admin/BackofficeContent';
import { ParsedUrlQuery } from 'querystring';
import { ZodTypeDef } from 'zod/lib/types';
import { SnackbarMessage, useSnackbar } from 'notistack';
import { TRPCClientErrorLike } from '@trpc/client';
import { AnyMutationProcedure, AnyQueryProcedure, inferProcedureInput, inferProcedureOutput } from '@trpc/server';
import { DecorateProcedure } from '@trpc/react-query/dist/shared';
import { BackofficeContentLoading } from '../layout/admin/BackofficeContentLoading';
import { DirtyFormUnloadAlert } from './fields/DirtyFormUnloadAlert';
import { BackofficeContentError } from '../layout/admin/BackofficeContentError';

const formRedirectSchema = z.object({
  redirect: z.string().optional(),
});

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

interface OptionalFormContentProps {
  buttonLabel: string;
  buttonIcon: React.ReactElement;
  buttonColor: Parameters<typeof Button>[0]['color'];
}

interface FormContentProps<TMutationProcedure extends AnyMutationProcedure, TData> {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
  schema: z.ZodType<inferProcedureInput<TMutationProcedure>>;
  urlSuccessFor: (data: TData) => string;
  urlCancel: string;
  mutationProcedure: DecorateProcedure<TMutationProcedure, any, any>;
  defaultValues: DeepPartial<inferProcedureInput<TMutationProcedure>>;
  invalidate?: { reset: () => Promise<void> }[];
  successMessage: (data: TData) => SnackbarMessage;
  hiddenControls?: boolean;
}

interface CreateFormContentProps<TMutationProcedure extends AnyMutationProcedure> extends FormContentProps<TMutationProcedure, inferProcedureOutput<TMutationProcedure>>, Partial<OptionalFormContentProps> {

}

interface UpdateFormContentProps<TQueryProcedure extends AnyQueryProcedure, TMutationProcedure extends AnyMutationProcedure, TQueryInputSchema extends z.ZodType<inferProcedureInput<TQueryProcedure>, ZodTypeDef, any>> extends FormContentProps<TMutationProcedure, inferProcedureOutput<TMutationProcedure>>, Partial<OptionalFormContentProps> {
  queryProcedure: DecorateProcedure<TQueryProcedure, any, any>;
  querySchema: TQueryInputSchema;
  queryParams: ParsedUrlQuery;
}

interface InternalFormContentProps<TMutationProcedure extends AnyMutationProcedure, TData> extends FormContentProps<TMutationProcedure, TData>, OptionalFormContentProps {
  isLoading: boolean;
  error?: any;
}

const InternalFormContent = <TMutationProcedure extends AnyMutationProcedure>({
  children,
  title,
  icon,
  schema,
  urlSuccessFor,
  urlCancel,
  mutationProcedure,
  defaultValues,
  invalidate,
  successMessage,
  buttonLabel,
  buttonIcon,
  buttonColor,
  hiddenControls,
  isLoading: isQueryLoading,
  error: queryError,
}: InternalFormContentProps<TMutationProcedure, inferProcedureOutput<TMutationProcedure>>) => {
  const router = useRouter();
  const redirect: string | null = useMemo(() => {
    const parsed = formRedirectSchema.safeParse(router.query);
    // No open redirect
    return parsed.success && parsed.data.redirect && parsed.data.redirect.startsWith('/') ? `/${parsed.data.redirect}` : null;
  }, [router]);

  const { enqueueSnackbar } = useSnackbar();

  const { mutate, isLoading, error } = mutationProcedure.useMutation({
    onSuccess: (data) => {
      const invalidations = (invalidate ?? []).map(procedure => procedure.reset());
      return Promise.all([router.push(redirect ?? urlSuccessFor(data)), ...invalidations])
        .then(() => enqueueSnackbar(successMessage(data), { variant: 'success' }));
    },
  });

  const handleSubmit = useCallback((data: inferProcedureInput<TMutationProcedure>) => {
    mutate(data);
  }, []);

  const handleCancel = useCallback(() => {
    return router.push(redirect ?? urlCancel);
  }, []);

  return !isQueryLoading ? (
    <BackofficeContent
      title={title}
      icon={icon}
    >
      <FormContainer onSuccess={handleSubmit} resolver={zodResolver(schema)} defaultValues={defaultValues}>
        {process.env.NODE_ENV === 'production' && ( // Disable this feature in development, as it slows down testing
          <DirtyFormUnloadAlert disabled={isLoading} message="Certaines modifications n'ont pas été sauvegardées, souhaitez-vous vraiment quitter la page ?" />
        )}
        {!isLoading ? (
          <Grid container spacing={2}>
            <FormErrorAlertItem serverError={error} />
            <Grid item xs={12}>
              {children}
            </Grid>
            {!hiddenControls && (
              <Grid item xs={12} container direction="row" spacing={2} justifyContent="flex-end">
                <Grid item>
                  <Button variant="outlined" color="inherit" startIcon={<Cancel />} onClick={handleCancel}>Annuler</Button>
                </Grid>
                <Grid item>
                  <Button type="submit" variant="contained" color={buttonColor} startIcon={buttonIcon}>
                    {buttonLabel}
                  </Button>
                </Grid>
              </Grid>
            )}
          </Grid>
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center">
            <CircularProgress sx={{ mt: 5 }} />
          </Box>
        )}
      </FormContainer>
    </BackofficeContent>
  ) : !error ? ( // TODO skeleton here
    <BackofficeContentLoading />
  ) : (
    <BackofficeContentError error={queryError} />
  );
}

export const CreateFormContent = <TMutationProcedure extends AnyMutationProcedure>({ children, ...props }: CreateFormContentProps<TMutationProcedure>): JSX.Element => {
  return (
    <InternalFormContent
      buttonLabel="Créer"
      buttonIcon={<AddBox/>}
      buttonColor="success"
      {...props}
      isLoading={false}
    >
      {children}
    </InternalFormContent>
  );
};

export const UpdateFormContent = <TQueryProcedure extends AnyQueryProcedure, TMutationProcedure extends AnyMutationProcedure, TQueryInputSchema extends z.ZodType<inferProcedureInput<TQueryProcedure>, ZodTypeDef, any>>({
  children,
  defaultValues,
  queryProcedure,
  querySchema,
  queryParams,
  ...props
}: UpdateFormContentProps<TQueryProcedure, TMutationProcedure, TQueryInputSchema>): JSX.Element => {
  const parsed = querySchema.parse(queryParams); // TODO error handling
  const { data, isLoading, error } = queryProcedure.useQuery(parsed);
  return (
    <InternalFormContent
      buttonLabel="Sauvegarder"
      buttonIcon={<Save/>}
      buttonColor={undefined}
      {...props}
      isLoading={isLoading}
      error={error}
      defaultValues={{ ...defaultValues, ...data }}
    >
      {children}
    </InternalFormContent>
  );
};
