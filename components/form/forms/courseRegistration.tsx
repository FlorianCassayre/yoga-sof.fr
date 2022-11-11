import React, { useMemo } from 'react';
import { DeepPartial, SwitchElement } from 'react-hook-form-mui';
import { z } from 'zod';
import {
} from '../../../lib/common/newSchemas';
import { Grid, Alert } from '@mui/material';
import { Person } from '@mui/icons-material';
import { CreateFormContent } from '../form';
import { QueryKey } from '../../../lib/server/controllers';
import { userCreateSchema } from '../../../lib/common/newSchemas/user';
import { SelectUser } from '../newFields/SelectUser';
import { SelectCourse } from '../newFields/SelectCourse';
import { useRouter } from 'next/router';

const CourseRegistrationBatchFormFields = () => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <Alert severity="warning">
        Attention, en principe les utilisateurs sont censés s'inscrire eux-mêmes aux séances.
        En remplissant ce formulaire vous prenez la main sur le compte des utilisateurs que vous inscrivez.
      </Alert>
    </Grid>
    <Grid item xs={12}>
      <SelectUser name="users" multiple />
    </Grid>
    <Grid item xs={12}>
      <SelectCourse name="courses" multiple />
    </Grid>
    <Grid item xs={12}>
      <SwitchElement name="notify" label="Notifier les utilisateurs de leur inscription" />
    </Grid>
  </Grid>
);

const userFormDefaultValues: DeepPartial<z.infer<typeof userCreateSchema>> = {
  name: '',
  email: null,
};

const commonFormProps = {
  icon: <Person />,
  defaultValues: userFormDefaultValues,
  urlSuccessFor: () => `/administration/seances`,
  urlCancel: `/administration/seances`,
  invalidate: [] as QueryKey[],
};

const querySchema = z.object({
  courseId: z.preprocess(
    (a) => a ? parseInt(z.string().parse(a), 10) : undefined,
    z.number().int().min(0).optional()
  ),
  userId: z.preprocess(
    (a) => a ? parseInt(z.string().parse(a), 10) : undefined,
    z.number().int().min(0).optional()
  ),
})

export const CourseRegistrationCreateBatchForm = () => {
  const router = useRouter();
  const actualDefaultValues = useMemo(() => {
    const parsed = querySchema.safeParse(router.query);
    if (parsed.success) {
      return { ...userFormDefaultValues, ...parsed.data };
    } else {
      return userFormDefaultValues;
    }
  }, [router]);

  return (
    <CreateFormContent
      {...commonFormProps}
      title="Inscription d'utilisateurs à des séances"
      schema={userCreateSchema}
      mutation="user.create"
      successMessage={(data) => `TODO`}
    >
      <CourseRegistrationBatchFormFields />
    </CreateFormContent>
  );
};
