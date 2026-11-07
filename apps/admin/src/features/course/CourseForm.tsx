'use client';

import {
  COURSE_TYPE_LABELS,
  COURSE_VISIBILITY_LABELS,
  type CourseType,
  courseTypeEnum,
  type CourseVisibility,
  courseVisibilityEnum,
} from '@yoga-sof/core';
import { TextFieldElement } from 'react-hook-form-mui';
import { DatePickerElement, TimePickerElement } from 'react-hook-form-mui/date-pickers';

import { Form } from '../../components/form/Form';
import type { FieldProps, IdVersion, MutationProcedure } from '../../components/form/types';
import { EnumSelectElement } from '../../components/input/EnumSelectElement';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { courseFormSchema } from './courseFormSchema';
import { COURSE_VISIBILITY_ICONS } from './visibility/courseVisibilityIcons';

type Course = NonNullable<RouterOutputs['course']['get']>;

interface CourseFormValues {
  type: CourseType;
  date: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  capacity: string;
  visibility: CourseVisibility;
  internalNotes: string;
}

const updateProcedure: MutationProcedure<Course, CourseFormValues & IdVersion> = {
  useMutation: () => {
    const mutation = api.course.update.useMutation();

    return {
      mutateAsync: ({ id, version, ...values }) =>
        mutation.mutateAsync({ ...courseFormSchema.parse(values), id, version }),
      isPending: mutation.isPending,
      error: mutation.error,
    };
  },
};

export const CourseForm = ({ id }: { id: number }) => {
  return (
    <Form<Course, CourseFormValues, typeof courseFormSchema>
      id={id}
      get={api.course.get}
      update={updateProcedure}
      schema={courseFormSchema}
      defaultValues={(course) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        const defaultEnd = new Date(tomorrow);
        defaultEnd.setHours(11);

        return {
          type: course?.type ?? 'adulte',
          date: course?.startsAt ?? tomorrow,
          startTime: course?.startsAt ?? tomorrow,
          endTime: course?.endsAt ?? defaultEnd,
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
      <DatePickerElement<CourseFormValues, 'date', Date>
        name="date"
        label="Date"
        disabled={disabled}
      />
      <TimePickerElement<CourseFormValues, 'startTime', Date>
        name="startTime"
        label="Heure de début"
        disabled={disabled}
      />
      <TimePickerElement<CourseFormValues, 'endTime', Date>
        name="endTime"
        label="Heure de fin"
        disabled={disabled}
      />
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
