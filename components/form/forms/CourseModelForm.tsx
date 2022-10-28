import React from 'react';
import { BackofficeContent } from '../../layout/admin/BackofficeContent';
import { Dashboard } from '@mui/icons-material';
import { Grid } from '@mui/material';
import {
  InputPrice,
  InputSlots,
  SelectCourseType,
  SelectWeekday,
  TimePickerElement
} from '../newFields';
import { z } from 'zod';
import { NewCreateEditForm } from '../NewCreateEditForm';
import { DeepPartial, SwitchElement } from 'react-hook-form-mui';
import { courseModelCreateSchema, courseModelUpdateSchema } from '../../../lib/common/newSchemas';

const courseModelSchemaDefaultValues: DeepPartial<z.infer<typeof courseModelCreateSchema>> = {
  slots: 1,
  price: 0,
  bundle: false,
};

interface CourseModelFormProps {
  edit: boolean;
}

export const CourseModelForm: React.FC<CourseModelFormProps> = ({ edit }) => {
  return (
    <BackofficeContent
      title={`${edit ? `Modification` : `Création`} d'un modèle de séance`}
      icon={<Dashboard />}
    >
      <NewCreateEditForm
        schema={courseModelUpdateSchema}
        defaultValues={courseModelSchemaDefaultValues}
        query="courseModel.get"
        mutation="courseModel.create"
        urlSuccessFor={() => `/administration/seances`}
        urlCancel={`/administration/seances`}
        edit={edit}
        editData={undefined}
      >
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
      </NewCreateEditForm>
    </BackofficeContent>
  );
};
