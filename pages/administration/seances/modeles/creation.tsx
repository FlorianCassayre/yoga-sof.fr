import { GuardedBackofficeContainer } from '../../../../components/layout/admin/GuardedBackofficeContainer';
import React from 'react';
import { BackofficeContent } from '../../../../components/layout/admin/BackofficeContent';
import { Dashboard } from '@mui/icons-material';
import { Grid } from '@mui/material';
import {
  InputPrice,
  InputSlots,
  SelectCourseType,
  SelectWeekday,
  TimePickerElement
} from '../../../../components/form/newFields';
import * as z from 'zod';
import { formatTimeHHhMM, WeekdayNames } from '../../../../lib/common/newDate';
import { NewCreateEditForm } from '../../../../components/form/NewCreateEditForm';
import { DeepPartial } from 'react-hook-form-mui';

const courseModelSchema = z.object({
  type: z.string(),
  weekday: z.number().int().min(0).max(WeekdayNames.length - 1),
  timeStart: z.date().transform(date => formatTimeHHhMM(date)),
  timeEnd: z.date().transform(date => formatTimeHHhMM(date)),
  slots: z.number().int().min(1).max(99),
  price: z.number().int().min(0).max(99),
});

const courseModelSchemaDefaultValues: DeepPartial<z.infer<typeof courseModelSchema>> = {
  slots: 1,
  price: 0,
};

const CourseModelForm = () => {
  return (
    <BackofficeContent
      title="Création d'un modèle de séance"
      icon={<Dashboard />}
    >
      <NewCreateEditForm schema={courseModelSchema} defaultValues={courseModelSchemaDefaultValues}>
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
        </Grid>
      </NewCreateEditForm>
    </BackofficeContent>
  );
};

export default function CourseModelCreate() {
  return (
    <GuardedBackofficeContainer>
      <CourseModelForm />
    </GuardedBackofficeContainer>
  );
}
