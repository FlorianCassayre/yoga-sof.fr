import React, { useEffect, useMemo, useState } from 'react';
import {
  DatePickerElement,
  FormContainer,
  TextFieldElement,
  useFormContext
} from 'react-hook-form-mui';
import { z } from 'zod';
import {
  courseModelGetTransformSchema,
} from '../../../lib/common/newSchemas';
import {
  Alert,
  Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack, Typography
} from '@mui/material';
import { InputPrice, InputSlots, SelectCourseType, SelectWeekday, TimePickerElement } from '../newFields';
import { AddBox, Delete, Event } from '@mui/icons-material';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { formatDateDDsMMsYYYY } from '../../../lib/common/newDate';

interface RangeSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: { dateStart: Date, dateEnd: Date }) => void;
}

const RangeSelectionDialog: React.FC<RangeSelectionDialogProps> = ({ open, onClose, onSelect }) => {
  const today = useMemo(() => {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    return today;
  }, []);
  const schema = useMemo(() => {
    return z.strictObject({
      dateStart: z.date().min(today, `La date ne peut pas être dans le passé`),
      dateEnd: z.date(),
    }).superRefine(({ dateStart, dateEnd }, ctx) => {
      if (!(dateStart <= dateEnd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dateStart'],
          message: `La date de début ne peut pas apparaître après la date de fin`,
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dateEnd'],
          message: `La date de fin ne peut pas apparaître avant la date de début`,
        });
      }
    });
  }, [today]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <FormContainer onSuccess={onSelect} resolver={zodResolver(schema)} defaultValues={{}}>
        <DialogTitle>
          Sélection de dates
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Choisissez un intervalle de dates à ajouter à la liste.
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <DatePickerElement name="dateStart" minDate={today} />
            </Grid>
            <Grid item xs={6}>
              <DatePickerElement name="dateEnd" minDate={today} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={onClose}>Annuler</Button>
          <Button type="submit">
            Ajouter ces séances
          </Button>
        </DialogActions>
      </FormContainer>
    </Dialog>
  );
};

const DatesSelectionList = () => {
  const { getValues, setValue, watch } = useFormContext();
  const [open, setOpen] = useState(false);
  const handleSelect = ({ dateStart, dateEnd }: { dateStart: Date, dateEnd: Date }) => {
    setOpen(false);
    const values = getValues();
    const weekday = values.weekday as number;
    const currentDates = values.dates as Date[];
    const computeDatesBetween = (): Date[] => {
      let date = dateStart;
      const acc: Date[] = [];
      while (date.getDay() != (weekday + 1) % 7) {
        date = new Date(date);
        date.setDate(date.getDate() + 1);
      }
      while (date <= dateEnd) {
        acc.push(date);
        date = new Date(date);
        date.setDate(date.getDate() + 7);
      }
      return acc;
    };
    let allDates = currentDates.concat(computeDatesBetween());
    allDates = Array.from(new Set(allDates));
    allDates.sort((a, b) => a < b ? -1 : 1);
    setValue('dates', allDates);
  };
  const watchDates = watch('dates');
  const handleRemoveDate = (date: Date) => {
    const dates = getValues().dates as Date[];
    setValue('dates', dates.filter(d => d !== date));
  };
  const watchWeekday = watch('weekday');
  useEffect(() => {
    setValue('dates', []);
  }, [watchWeekday]);
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Typography variant="h6" component="div">
            Séances planifiées
          </Typography>
          <RangeSelectionDialog open={open} onClose={() => setOpen(false)} onSelect={handleSelect} />
          <Button endIcon={<AddBox />} onClick={() => setOpen(true)} disabled={watchWeekday == null}>
            Ajouter
          </Button>
        </Stack>
      </CardContent>
      <List dense>
        {watchDates.map((date: Date) => (
          <ListItem
            key={date.getTime()}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleRemoveDate(date)}>
                <Delete />
              </IconButton>
            }
          >
            <ListItemText
              primary={formatDateDDsMMsYYYY(date)}
            />
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

const courseFormDefaultValues = {
  slots: 1,
  price: 0,
  dates: [] as Date[],
};

const commonFormProps = {
  icon: <Event />,
  urlSuccessFor: (data: Course) => `/administration/seances`,
  urlCancel: `/administration/seances`,
  invalidate: ['course.find', 'course.findAll'] as QueryKey[],
};

const CourseCreateFormContent = () => {
  const { watch, setValue } = useFormContext();
  const watchCourseModel = watch('model');
  const isUsingModel = useMemo(() => watchCourseModel != null, [watchCourseModel]);
  useEffect(() => {
    if (watchCourseModel) {
      setValue('type', watchCourseModel.type);
      setValue('weekday', watchCourseModel.weekday);
      setValue('timeStart', watchCourseModel.timeStart);
      setValue('timeEnd', watchCourseModel.timeEnd);
      setValue('slots', watchCourseModel.slots);
      setValue('price', watchCourseModel.price);
    }
  }, [watchCourseModel, setValue]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="info">
          Vous pouvez optionnellement choisir un modèle de séance pour pré-remplir certains champs.
        </Alert>
      </Grid>
      <Grid item xs={12}>
        <SelectCourseModel name="model" />
      </Grid>
      <Grid item xs={12}>
        <SelectCourseType name="type" disabled={isUsingModel} />
      </Grid>
      <Grid item xs={12}>
        <SelectWeekday name="weekday" disabled={isUsingModel} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TimePickerElement name="timeStart" label="Heure de début" disabled={isUsingModel} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TimePickerElement name="timeEnd" label="Heure de fin" disabled={isUsingModel} />
      </Grid>
      <Grid item xs={12}>
        <InputSlots name="slots" disabled={isUsingModel} />
      </Grid>
      <Grid item xs={12}>
        <InputPrice name="price" disabled={isUsingModel} />
      </Grid>
      <Grid item xs={12} container justifyContent="center">
        <Grid item xs={12} md={6} lg={4}>
          <DatesSelectionList />
        </Grid>
      </Grid>
    </Grid>
  );
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
      <CourseCreateFormContent />
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
