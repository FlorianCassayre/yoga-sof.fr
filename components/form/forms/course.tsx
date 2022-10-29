import React from 'react';
import { DeepPartial, SwitchElement } from 'react-hook-form-mui';
import { z } from 'zod';
import {
  courseModelCreateSchema,
  courseModelGetSchema,
  courseModelGetTransformSchema,
  courseModelUpdateSchema
} from '../../../lib/common/newSchemas';
import { Grid } from '@mui/material';
import { InputPrice, InputSlots, SelectCourseType, SelectWeekday, TimePickerElement } from '../newFields';
import { Dashboard } from '@mui/icons-material';
import { CreateFormContent, UpdateFormContent } from '../form';
import { CourseModel } from '@prisma/client';
import { ParsedUrlQuery } from 'querystring';
import { QueryKey } from '../../../lib/server/controllers';

const CourseModelFields = () => (
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

const courseModelDefaultValues: DeepPartial<z.infer<typeof courseModelCreateSchema>> = {
  slots: 1,
  price: 0,
  bundle: false,

  type: 'YOGA_ADULT' as any,
  weekday: 0,
  timeStart: '01:00',
  timeEnd: '02:30',
};

const commonProps = {
  icon: <Dashboard />,
  //children: <CourseModelFields />,
  defaultValues: courseModelDefaultValues,
  urlSuccessFor: (data: CourseModel) => `/administration/seances`,
  urlCancel: `/administration/seances`,
  invalidate: ['courseModel.get', 'courseModel.getAll'] as QueryKey[],
};

export const CourseModelCreateForm = () => {
  return (
    <CreateFormContent
      {...commonProps}
      title="Création d'un modèle de séance"
      schema={courseModelCreateSchema}
      mutation="courseModel.create"
    >
      <CourseModelFields />
    </CreateFormContent>
  );
};

export const CourseModelUpdateForm = ({ queryData }: { queryData: ParsedUrlQuery }) => { // z.infer<typeof courseModelGetSchema>
  return (
    <UpdateFormContent
      {...commonProps}
      title="Création d'un modèle de séance"
      schema={courseModelUpdateSchema}
      mutation="courseModel.update"
      query="courseModel.get"
      querySchema={courseModelGetTransformSchema}
      queryData={queryData}
    >
      <CourseModelFields />
    </UpdateFormContent>
  );
};
