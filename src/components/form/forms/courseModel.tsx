import React from 'react';
import { DeepPartial, SwitchElement } from 'react-hook-form-mui';
import { z } from 'zod';
import {
  courseModelCreateSchema,
  courseModelFindSchema,
  courseModelGetTransformSchema,
  courseModelUpdateSchema
} from '../../../common/schemas';
import { Grid } from '@mui/material';
import { InputPrice, InputSlots, SelectCourseType, SelectWeekday, TimePickerElement } from '../fields';
import { Event } from '@mui/icons-material';
import { CreateFormContent, UpdateFormContent } from '../form';
import { CourseModel } from '@prisma/client';
import { ParsedUrlQuery } from 'querystring';
import { trpc } from '../../../common/trpc';

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
};

const useProceduresToInvalidate = () => {
  const { courseModel } = trpc.useContext();
  return [courseModel.find, courseModel.findAll];
};

const commonFormProps = {
  icon: <Event />,
  //children: <CourseModelFields />,
  defaultValues: courseModelFormDefaultValues,
  urlSuccessFor: (data: CourseModel) => `/administration/seances`,
  urlCancel: `/administration/seances`,
};

export const CourseModelCreateForm = () => {
  return (
    <CreateFormContent
      {...commonFormProps}
      title="Création d'un modèle de séance"
      schema={courseModelCreateSchema}
      mutationProcedure={trpc.courseModel.create}
      successMessage={(data) => `Le modèle a été créé.`}
      invalidate={useProceduresToInvalidate()}
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
      mutationProcedure={trpc.courseModel.update}
      queryProcedure={trpc.courseModel.find}
      querySchema={courseModelGetTransformSchema}
      queryParams={queryData}
      successMessage={(data) => `Le modèle a été mis à jour.`}
      invalidate={useProceduresToInvalidate()}
    >
      <CourseModelFormFields />
    </UpdateFormContent>
  );
};
