import React from 'react';
import { DeepPartial, SwitchElement, TextFieldElement } from 'react-hook-form-mui';
import { z } from 'zod';
import {
  courseModelGetTransformSchema,
} from '../../../lib/common/newSchemas';
import { Alert, Grid } from '@mui/material';
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

const courseFormDefaultValues: DeepPartial<z.infer<typeof courseCreateSchema>> = {
  slots: 1,
  price: 0,

  type: 'YOGA_ADULT' as any,
  weekday: 0,
} as any; // FIXME

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
      <Grid container spacing={2}>

      </Grid>
    </CreateFormContent>
  );
};

export const CourseUpdateForm = ({ queryData }: { queryData: ParsedUrlQuery }) => {
  return (
    <UpdateFormContent
      {...commonFormProps}
      title="Modification d'une séance planifiée"
      schema={courseUpdateSchema}
      mutation="course.update"
      query="course.findUpdate"
      querySchema={courseModelGetTransformSchema}
      queryParams={queryData}
      successMessage={() => 'Les caractéristiques de la séance ont été mises à jour'}
      defaultValues={{}}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Alert severity="warning">
            Attention, vous êtes sur le point de modifier les caractéristiques d'une séance déjà planifiée.
            Si vous changez le prix, les utilisateurs déjà inscrits et n'ayant pas encore payé devront s'acquitter du nouveau montant.
          </Alert>
        </Grid>
        <Grid item xs={12}>
          <InputSlots name="slots" />
        </Grid>
        <Grid item xs={12}>
          <InputPrice name="price" />
        </Grid>
      </Grid>
    </UpdateFormContent>
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
      successMessage={() => 'Les notes de la séance ont été mises à jour'}
      defaultValues={{ notes: null }}
    >
      <TextFieldElement name="notes" label="Notes (visibles seulement par vous)" multiline rows={4} fullWidth />
    </UpdateFormContent>
  );
};
