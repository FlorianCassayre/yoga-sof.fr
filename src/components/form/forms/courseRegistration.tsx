import React, { useMemo } from 'react';
import { DeepPartial, SwitchElement } from 'react-hook-form-mui';
import { z } from 'zod';
import {
} from '../../../common/schemas';
import { Grid, Alert } from '@mui/material';
import { Person } from '@mui/icons-material';
import { CreateFormContent } from '../form';
import { SelectUser } from '../fields/SelectUser';
import { SelectCourse } from '../fields/SelectCourse';
import { useRouter } from 'next/router';
import { courseRegistrationCreateSchema } from '../../../common/schemas/courseRegistration';
import { trpc } from '../../../common/trpc';

const CourseRegistrationBatchFormFields = () => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <Alert severity="warning">
        Attention, en principe les utilisateurs sont censés s'inscrire eux-mêmes aux séances.
        En remplissant ce formulaire vous prenez la main sur les comptes des utilisateurs que vous inscrivez.
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

const courseRegistrationFormDefaultValues: DeepPartial<z.infer<typeof courseRegistrationCreateSchema>> = {
  courses: [],
  users: [],
  notify: true,
};

const useProceduresToInvalidate = () => {
  const { courseRegistration, course } = trpc.useContext();
  return [courseRegistration.findAll, courseRegistration.findAllEvents, courseRegistration.findAllActive, course.find, course.findAll];
};

const commonFormProps = {
  icon: <Person />,
  urlSuccessFor: () => `/administration/inscriptions`,
  urlCancel: `/administration/inscriptions`,
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
  const actualDefaultValues: typeof courseRegistrationFormDefaultValues = useMemo(() => {
    const parsed = querySchema.safeParse(router.query);
    if (parsed.success) {
      const { courseId, userId } = parsed.data;
      return {
        ...courseRegistrationFormDefaultValues,
        courses: courseId !== undefined ? [courseId] : courseRegistrationFormDefaultValues.courses,
        users: userId !== undefined ? [userId] : courseRegistrationFormDefaultValues.users,
      };
    } else {
      return courseRegistrationFormDefaultValues;
    }
  }, [router]);

  return (
    <CreateFormContent
      {...commonFormProps}
      defaultValues={actualDefaultValues}
      title="Inscription d'utilisateurs à des séances"
      schema={courseRegistrationCreateSchema}
      mutationProcedure={trpc.courseRegistration.create}
      successMessage={(data) => data.length + (data.length > 1 ? ` inscriptions ont été effectuées.` : ` inscription a été effectuée.`)}
      invalidate={useProceduresToInvalidate()}
    >
      <CourseRegistrationBatchFormFields />
    </CreateFormContent>
  );
};
