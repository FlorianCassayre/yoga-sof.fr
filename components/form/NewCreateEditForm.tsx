import React, { useCallback, useEffect, useState } from 'react';
import { DeepPartial, FormContainer } from 'react-hook-form-mui';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import * as z from 'zod';
import { Button, Grid } from '@mui/material';
import { AddBox, Cancel, Save } from '@mui/icons-material';

interface NewCreateEditFormProps<T extends z.ZodTypeAny> {
  children: React.ReactNode;
  edit?: boolean;
  schema: T;
  defaultValues: DeepPartial<z.infer<T>>;
}

export const NewCreateEditForm = <T extends z.ZodTypeAny>({
  children,
  edit,
  schema,
  defaultValues,
}: NewCreateEditFormProps<T>): JSX.Element => {
  const [isDirty, setDirty] = useState(false);

  const handleSubmit = useCallback((data: any) => {

  }, []);

  const handleCancel = useCallback(() => {

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
    <FormContainer onSuccess={data => console.log(data)} resolver={zodResolver(schema)} defaultValues={defaultValues}>
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
