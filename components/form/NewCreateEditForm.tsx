import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DeepPartial, FormContainer } from 'react-hook-form-mui';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Grid } from '@mui/material';
import { AddBox, Cancel, Save } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { trpc } from '../../lib/common/trpc';
import { inferHandlerInput, inferProcedureInput, inferProcedureOutput, ProcedureRecord } from '@trpc/server';
import { AppRouter } from '../../lib/server/controllers';

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

interface NewCreateEditFormProps<TQueryPath extends QueryKey, TMutationPath extends MutationKey, TEdit extends true | false> {
  children: React.ReactNode;
  schema: z.ZodType<Mutations[TMutationPath]['input']>;
  defaultValues: DeepPartial<z.infer<z.ZodType<Mutations[TMutationPath]['input']>>>;
  query: TQueryPath;
  edit: TEdit,
  editData: TEdit extends true ? inferHandlerInput<AppRouter["_def"]["queries"][TQueryPath]> : undefined,
  mutation: TMutationPath;
  urlSuccessFor: (data: Queries[TQueryPath]['output'] | Mutations[TMutationPath]['output']) => string;
  urlCancel: string;
}

export const NewCreateEditForm = <TQueryPath extends QueryKey, TMutationPath extends MutationKey, TEdit extends true | false>({
  children,
  schema,
  defaultValues,
  query,
  edit,
  editData,
  mutation,
  urlSuccessFor,
  urlCancel,
}: NewCreateEditFormProps<TQueryPath, TMutationPath, TEdit>): JSX.Element => {
  const [isDirty, setDirty] = useState(false);
  const router = useRouter();

  // The following is React-safe, although it may not look like it
  const constantEdit = useMemo(() => edit, []);
  const [initialData, setInitialData] =
    useState<DeepPartial<z.infer<z.ZodType<Mutations[TMutationPath]['input']>>> | undefined>(constantEdit ? undefined : defaultValues);
  if (constantEdit) {
    trpc.useQuery([query, ...(editData as inferHandlerInput<AppRouter["_def"]["queries"][TQueryPath]>)], {
      onSuccess: (fetchedInitialData) => {
        setInitialData({ ...defaultValues, ...fetchedInitialData });
      },
    });
  }
  // End dangerous

  const { mutate, isLoading, isError } = trpc.useMutation(mutation, {
    onSuccess: (data) => {
      // TODO: once it succeeds, fallback to forever loading state
      return router.push(urlSuccessFor(data));
    },
  });

  const handleSubmit = useCallback((data: z.infer<z.ZodType<Mutations[TMutationPath]['input']>>) => {
    mutate(data);
  }, []);

  const handleCancel = useCallback(() => {
    return router.push(urlCancel);
  }, []);

  useEffect(() => {
    if (isDirty) {
      const eventType = 'beforeunload' as const;
      const listener = () => {
        return 'Souhaitez-vous abandonner les changements ?';
      };
      window.addEventListener(eventType, listener);
      return () => {
        window.removeEventListener(eventType, listener);
      };
    }
  }, [isDirty]);

  return initialData !== undefined ? (
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
  ) : (
    <>
      query loading...
    </>
  );
};
