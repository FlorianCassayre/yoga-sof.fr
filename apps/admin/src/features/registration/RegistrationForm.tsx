'use client';

import { Stack } from '@mui/material';
import { skipToken } from '@tanstack/react-query';
import { courseLabel, registrationCreateSchema } from '@yoga-sof/core';
import { notFound } from 'next/navigation';
import { useFormContext, useWatch } from 'react-hook-form';
import { SwitchElement } from 'react-hook-form-mui';

import { Form } from '../../components/form/Form';
import type { FieldProps } from '../../components/form/types';
import { AsyncAutocompleteElement } from '../../components/input/AsyncAutocompleteElement';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { isNotFoundError } from '../../server/isNotFoundError';

type Course = RouterOutputs['course']['list']['rows'][number];
type CourseBundle = RouterOutputs['courseBundle']['get'];
type User = RouterOutputs['user']['list']['rows'][number];

interface RegistrationFormValues {
  courses: Course[];
  bundles: CourseBundle[];
  users: User[];
  notify: boolean;
}

interface RegistrationFormProps {
  courseId?: number;
  courseBundleId?: number;
  userId?: string;
}

const RegistrationFields = ({ disabled }: FieldProps) => {
  const { control } = useFormContext<RegistrationFormValues>();
  const courses = useWatch({ control, name: 'courses' });
  const bundles = useWatch({ control, name: 'bundles' });

  return (
    <Stack spacing={2}>
      <AsyncAutocompleteElement<Course, RegistrationFormValues, true>
        name="courses"
        label="Séances"
        multiple
        list={api.course.list}
        sort={{ field: 'startsAt', sort: 'asc' }}
        getOptionLabel={courseLabel}
        listInput={{ upcoming: true, individual: true }}
        disabled={disabled || bundles.length > 0}
        helperText={
          bundles.length > 0 ? 'Retirez les lots pour sélectionner des séances.' : undefined
        }
      />
      <AsyncAutocompleteElement<CourseBundle, RegistrationFormValues, true>
        name="bundles"
        label="Lots de séances"
        multiple
        list={api.courseBundle.list}
        sort={{ field: 'label', sort: 'asc' }}
        getOptionLabel={(bundle) => bundle.label}
        disabled={disabled || courses.length > 0}
        helperText={
          courses.length > 0 ? 'Retirez les séances pour sélectionner des lots.' : undefined
        }
      />
      <AsyncAutocompleteElement<User, RegistrationFormValues, true>
        name="users"
        label="Utilisateurs"
        multiple
        list={api.user.list}
        sort={{ field: 'name', sort: 'asc' }}
        getOptionLabel={(user) => user.name ?? '-'}
        preload
        disabled={disabled}
      />
      <SwitchElement<RegistrationFormValues>
        name="notify"
        label="Notifier les utilisateurs"
        disabled={disabled}
      />
    </Stack>
  );
};

export const RegistrationForm = ({ courseId, courseBundleId, userId }: RegistrationFormProps) => {
  const presetCourseQuery = api.course.get.useQuery(
    courseId == null ? skipToken : { id: courseId },
  );
  const presetBundleQuery = api.courseBundle.get.useQuery(
    courseBundleId == null ? skipToken : { id: courseBundleId },
  );
  const presetUserQuery = api.user.get.useQuery(userId == null ? skipToken : { id: userId });

  for (const error of [presetCourseQuery.error, presetBundleQuery.error, presetUserQuery.error]) {
    if (error) {
      if (isNotFoundError(error)) {
        notFound();
      }
      return null;
    }
  }
  if (
    (courseId != null && !presetCourseQuery.data) ||
    (courseBundleId != null && !presetBundleQuery.data) ||
    (userId != null && !presetUserQuery.data)
  ) {
    return null;
  }

  return (
    <Form<void, RegistrationFormValues, typeof registrationCreateSchema>
      create={api.registration.create}
      schema={registrationCreateSchema}
      defaultValues={() => ({
        courses: presetCourseQuery.data ? [presetCourseQuery.data] : [],
        bundles: presetBundleQuery.data ? [presetBundleQuery.data] : [],
        users: presetUserQuery.data ? [presetUserQuery.data] : [],
        notify: false,
      })}
      redirectTo={() => '/inscriptions'}
      createdMessage="Utilisateurs inscrits."
      submitLabel="Inscrire"
      cancelHref="/inscriptions"
    >
      {RegistrationFields}
    </Form>
  );
};
