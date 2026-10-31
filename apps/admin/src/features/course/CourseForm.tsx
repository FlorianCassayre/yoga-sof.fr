'use client';

import {
  COURSE_TYPE_LABELS,
  COURSE_VISIBILITY_LABELS,
  courseCreateSchema,
  courseTypeEnum,
  courseVisibilityEnum,
} from '@yoga-sof/core';
import { TextFieldElement } from 'react-hook-form-mui';
import { DateTimePickerElement } from 'react-hook-form-mui/date-pickers';
import type { z } from 'zod';

import { Form } from '../../components/form/Form';
import type { FieldProps } from '../../components/form/types';
import { EnumSelectElement } from '../../components/input/EnumSelectElement';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { COURSE_VISIBILITY_ICONS } from './visibility/courseVisibilityIcons';

type Course = NonNullable<RouterOutputs['course']['get']>;

type CourseFormValues = Omit<z.infer<typeof courseCreateSchema>, 'capacity'> & {
  capacity: string;
};

export const CourseForm = ({ id }: { id?: number }) => {
  return (
    <Form<Course, CourseFormValues>
      id={id}
      get={api.course.get}
      create={api.course.create}
      update={api.course.update}
      schema={courseCreateSchema}
      defaultValues={(course) => {
        const startsAt = new Date();
        startsAt.setDate(startsAt.getDate() + 1);
        startsAt.setHours(9, 0, 0, 0);
        const endsAt = new Date(startsAt);
        endsAt.setHours(11);

        return {
          type: course?.type ?? 'adulte',
          startsAt: course?.startsAt ?? startsAt,
          endsAt: course?.endsAt ?? endsAt,
          capacity: course ? String(course.capacity) : '10',
          visibility: course?.visibility ?? 'public',
          internalNotes: course?.internalNotes ?? '',
        };
      }}
      redirectTo={(course) => `/seances/${course.id}`}
      createdMessage="Séance créée."
      updatedMessage="Séance modifiée."
      cancelHref="/seances"
    >
      {CourseFields}
    </Form>
  );
};

const CourseFields = ({ disabled }: FieldProps) => {
  return (
    <>
      <EnumSelectElement<CourseFormValues>
        name="type"
        label="Type"
        values={courseTypeEnum.enumValues}
        labels={COURSE_TYPE_LABELS}
        disabled={disabled}
      />
      <DateTimePickerElement<CourseFormValues> name="startsAt" label="Début" disabled={disabled} />
      <DateTimePickerElement<CourseFormValues> name="endsAt" label="Fin" disabled={disabled} />
      <TextFieldElement<CourseFormValues>
        name="capacity"
        label="Capacité"
        type="number"
        disabled={disabled}
      />
      <EnumSelectElement<CourseFormValues>
        name="visibility"
        label="Visibilité"
        values={courseVisibilityEnum.enumValues}
        labels={COURSE_VISIBILITY_LABELS}
        icons={COURSE_VISIBILITY_ICONS}
        disabled={disabled}
      />
      <TextFieldElement<CourseFormValues>
        name="internalNotes"
        label="Notes internes"
        multiline
        disabled={disabled}
      />
    </>
  );
};
