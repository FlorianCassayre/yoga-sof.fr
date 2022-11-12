import React from 'react';
import { DeepPartial, SwitchElement, TextFieldElement } from 'react-hook-form-mui';
import { z } from 'zod';
import {
  courseModelGetTransformSchema,
} from '../../../lib/common/newSchemas';
import { Grid } from '@mui/material';
import { InputPrice, InputSlots, SelectCourseType, SelectWeekday, TimePickerElement } from '../newFields';
import { Event } from '@mui/icons-material';
import { CreateFormContent, UpdateFormContent } from '../form';
import { Course } from '@prisma/client';
import { ParsedUrlQuery } from 'querystring';
import { QueryKey } from '../../../lib/server/controllers';
import {
  courseCreateSchema,
  courseFindTransformSchema,
  courseUpdateNotesSchema,
  courseUpdateSchema
} from '../../../lib/common/newSchemas/course';
import { SelectCourseModel } from '../newFields/SelectCourseModel';

const CourseFormFields = () => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <SelectCourseModel name="model" />
    </Grid>
    <Grid item xs={12}>
      <SelectCourseType name="type" />
    </Grid>
    <Grid item xs={12}>
      <SelectWeekday name="weekday" />
    </Grid>
    <Grid item xs={12} sm={6}>
    </Grid>
    <Grid item xs={12} sm={6}>
    </Grid>
    <Grid item xs={12}>
      <InputSlots name="slots" />
    </Grid>
    <Grid item xs={12}>
      <InputPrice name="price" />
    </Grid>
  </Grid>
);

const courseFormDefaultValues: DeepPartial<z.infer<typeof courseCreateSchema>> = {
  slots: 1,
  price: 0,

  type: 'YOGA_ADULT' as any,
  weekday: 0,
};

const commonFormProps = {
  icon: <Event />,
  urlSuccessFor: (data: Course) => `/administration/seances`,
  urlCancel: `/administration/seances`,
  invalidate: ['course.find', 'course.findAll'] as QueryKey[],
};

export const CourseCreateForm = () => {
  return (
    <CreateFormContent
      {...commonFormProps}
      title="Planification de séances"
      schema={courseCreateSchema as any} // FIXME
      mutation={"course.create" as any} // FIXME
      successMessage={() => 'TODO'}
      defaultValues={courseFormDefaultValues}
    >
      <CourseFormFields />
    </CreateFormContent>
  );
};

export const CourseUpdateNotesForm = ({ queryData }: { queryData: ParsedUrlQuery }) => {
  return (
    <UpdateFormContent
      {...commonFormProps}
      title="Modification des notes d'une séance"
      schema={courseUpdateNotesSchema}
      mutation="course.updateNotes"
      query="course.findUpdateNotes"
      querySchema={courseFindTransformSchema}
      queryParams={queryData}
      successMessage={() => 'Les notes ont été mises à jour'}
      defaultValues={{ notes: null }}
    >
      <TextFieldElement name="notes" label="Notes (visibles seulement par vous)" multiline rows={4} fullWidth />
    </UpdateFormContent>
  );
};

export const CourseUpdateForm = CourseUpdateNotesForm; // FIXME
