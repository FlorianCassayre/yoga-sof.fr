import React from 'react';
import { DeepPartial, SwitchElement } from 'react-hook-form-mui';
import { z } from 'zod';
import {
  courseModelCreateSchema,
  courseModelFindSchema,
  courseModelGetTransformSchema,
  courseModelUpdateSchema
} from '../../../lib/common/newSchemas';
import { Grid } from '@mui/material';
import { InputPrice, InputSlots, SelectCourseType, SelectWeekday, TimePickerElement } from '../newFields';
import { Event } from '@mui/icons-material';
import { CreateFormContent, UpdateFormContent } from '../form';
import { CourseModel } from '@prisma/client';
import { ParsedUrlQuery } from 'querystring';
import { QueryKey } from '../../../lib/server/controllers';

const CourseModelFormFields = () => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <SelectCourseType name="type" />
    </Grid>
    <Grid item xs={12}>
      <SelectWeekday name="weekday" />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TimePickerElement name="timeStart" label="Heure de début" />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TimePickerElement name="timeEnd" label="Heure de fin" />
    </Grid>
    <Grid item xs={12}>
      <InputSlots name="slots" />
    </Grid>
    <Grid item xs={12}>
      <InputPrice name="price" />
    </Grid>
    <Grid item xs={12}>
      <SwitchElement name="bundle" label="Lot de séances" />
    </Grid>
  </Grid>
);

const courseModelFormDefaultValues: DeepPartial<z.infer<typeof courseModelCreateSchema>> = {
  slots: 1,
  price: 0,
  bundle: false,

  type: 'YOGA_ADULT' as any,
  weekday: 0,
  timeStart: '01:00',
  timeEnd: '02:30',
};

const commonFormProps = {
  icon: <Event />,
  //children: <CourseModelFields />,
  defaultValues: courseModelFormDefaultValues,
  urlSuccessFor: (data: CourseModel) => `/administration/seances`,
  urlCancel: `/administration/seances`,
  invalidate: ['courseModel.find', 'courseModel.findAll'] as QueryKey[],
};

export const CourseModelCreateForm = () => {
  return (
    <CreateFormContent
      {...commonFormProps}
      title="Création d'un modèle de séance"
      schema={courseModelCreateSchema}
      mutation="courseModel.create"
      successMessage={(data) => `Le modèle a été créé.`}
    >
      <CourseModelFormFields />
    </CreateFormContent>
  );
};

export const CourseModelUpdateForm = ({ queryData }: { queryData: ParsedUrlQuery }) => { // z.infer<typeof courseModelGetSchema>
  return (
    <UpdateFormContent
      {...commonFormProps}
      title="Modification d'un modèle de séance"
      schema={courseModelUpdateSchema}
      mutation="courseModel.update"
      query="courseModel.find"
      querySchema={courseModelGetTransformSchema}
      queryParams={queryData}
      successMessage={(data) => `Le modèle a été mis à jour.`}
    >
      <CourseModelFormFields />
    </UpdateFormContent>
  );
};
