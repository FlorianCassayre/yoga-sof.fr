import React, { useCallback, useEffect, useState } from 'react';
import { DeepPartial, FormContainer } from 'react-hook-form-mui';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Grid } from '@mui/material';
import { AddBox, Cancel, Save } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { trpc } from '../../lib/common/trpc';
import { inferProcedureInput, inferProcedureOutput, ProcedureRecord } from '@trpc/server';
import { AppRouter } from '../../lib/server/controllers';

type inferProcedures<TObj extends ProcedureRecord> = {
  [TPath in keyof TObj]: {
    input: inferProcedureInput<TObj[TPath]>;
    output: inferProcedureOutput<TObj[TPath]>;
  };
};

type Mutations = inferProcedures<AppRouter["_def"]["mutations"]>;
type MutationKey = keyof Mutations;

interface NewCreateEditFormProps<T extends z.ZodType<any, any, Mutations[P]['input']>, P extends MutationKey> {
  children: React.ReactNode;
  edit?: boolean;
  schema: T;
  defaultValues: DeepPartial<z.infer<T>>;
  mutation: P;
  urlCancel: string;
}

export const NewCreateEditForm = <T extends z.ZodType<any, any, Mutations[P]['input']>, P extends MutationKey>({
  children,
  edit,
  schema,
  defaultValues,
  mutation,
  urlCancel,
}: NewCreateEditFormProps<T, P>): JSX.Element => {
  const [isDirty, setDirty] = useState(false);
  const router = useRouter();

  const { mutate, isLoading } = trpc.useMutation(mutation);

  const handleSubmit = useCallback((data: z.infer<T>) => {
    console.log(data);
  }, []);

  const handleCancel = useCallback(() => {
    router.push(urlCancel);
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

  return (
    <FormContainer onSuccess={handleSubmit} resolver={zodResolver(schema)} defaultValues={defaultValues}>
      <Grid container spacing={2}>
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
    </FormContainer>
  );
};
