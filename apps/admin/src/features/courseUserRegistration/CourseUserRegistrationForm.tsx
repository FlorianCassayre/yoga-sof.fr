'use client';

import { Stack } from '@mui/material';
import { skipToken } from '@tanstack/react-query';
import { courseLabel } from '@yoga-sof/core';
import { notFound } from 'next/navigation';
import { SwitchElement } from 'react-hook-form-mui';

import { Form } from '../../components/form/Form';
import type { FieldProps } from '../../components/form/types';
import { AsyncAutocompleteElement } from '../../components/input/AsyncAutocompleteElement';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { isNotFoundError } from '../../server/isNotFoundError';

type Course = RouterOutputs['course']['list']['rows'][number];
type User = RouterOutputs['user']['list']['rows'][number];

interface CourseUserRegistrationFormValues {
  courses: Course[];
  users: User[];
  notify: boolean;
}

interface CourseUserRegistrationFormProps {
  courseId?: number;
}

const CourseUserRegistrationFields = ({ disabled }: FieldProps) => (
  <Stack spacing={2}>
    <AsyncAutocompleteElement<Course, CourseUserRegistrationFormValues, true>
      name="courses"
      label="Séances"
      multiple
      list={api.course.list}
      sort={{ field: 'startsAt', sort: 'asc' }}
      getOptionLabel={courseLabel}
      listInput={{ upcoming: true }}
      disabled={disabled}
    />
    <AsyncAutocompleteElement<User, CourseUserRegistrationFormValues, true>
      name="users"
      label="Utilisateurs"
      multiple
      list={api.user.list}
      sort={{ field: 'name', sort: 'asc' }}
      getOptionLabel={(user) => user.name ?? '-'}
      preload
      disabled={disabled}
    />
    <SwitchElement<CourseUserRegistrationFormValues>
      name="notify"
      label="Notifier les utilisateurs"
      disabled={disabled}
    />
  </Stack>
);

export const CourseUserRegistrationForm = ({ courseId }: CourseUserRegistrationFormProps) => {
  const presetCourseQuery = api.course.get.useQuery(
    courseId == null ? skipToken : { id: courseId },
  );

  if (presetCourseQuery.error) {
    if (isNotFoundError(presetCourseQuery.error)) {
      notFound();
    }
    return null;
  }
  if (courseId != null && !presetCourseQuery.data) {
    return null;
  }

  return (
    <Form<void, CourseUserRegistrationFormValues>
      create={api.registration.create}
      defaultValues={() => ({
        courses: presetCourseQuery.data ? [presetCourseQuery.data] : [],
        users: [],
        notify: false,
      })}
      redirectTo={() => '/inscriptions'}
      createdMessage="Utilisateurs inscrits."
      submitLabel="Inscrire"
      cancelHref="/inscriptions"
    >
      {CourseUserRegistrationFields}
    </Form>
  );
};
