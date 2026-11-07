'use client';

import { Alert, Button, IconButton, Stack, Typography } from '@mui/material';
import {
  COURSE_TYPE_LABELS,
  COURSE_VISIBILITY_LABELS,
  courseBatchCreateSchema,
  type CourseType,
  courseTypeEnum,
  type CourseVisibility,
  courseVisibilityEnum,
  formatMembershipPeriod,
  type Weekday,
  WEEKDAYS,
} from '@yoga-sof/core';
import { addDays, format, parseISO } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { SelectElement, TextFieldElement } from 'react-hook-form-mui';

import { Form } from '../../components/form/Form';
import type { FieldProps } from '../../components/form/types';
import { EnumSelectElement } from '../../components/input/EnumSelectElement';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { WeekCalendar } from './batch/WeekCalendar';
import { COURSE_VISIBILITY_ICONS } from './visibility/courseVisibilityIcons';

type CreatedCourses = RouterOutputs['course']['createBatch'];

interface CourseTemplateValues {
  weekday: Weekday;
  type: CourseType;
  startTime: string;
  endTime: string;
  capacity: string;
}

interface CourseBatchFormValues {
  visibility: CourseVisibility;
  templates: CourseTemplateValues[];
  weeks: string[];
}

const weekdayLabel = (weekday: Weekday): string => {
  const label = WEEKDAYS[weekday] ?? '';

  return label.charAt(0).toUpperCase() + label.slice(1);
};

const WEEKDAY_OPTIONS = [1, 2, 3, 4, 5, 6, 0].map((weekday) => ({
  id: weekday,
  label: weekdayLabel(weekday as Weekday),
}));

const emptyTemplate = (): CourseTemplateValues => ({
  weekday: 1,
  type: 'adulte',
  startTime: '09:00',
  endTime: '11:00',
  capacity: '10',
});

interface CourseTemplateRowProps {
  index: number;
  disabled: boolean;
  onRemove: () => void;
}

const CourseTemplateRow = ({ index, disabled, onRemove }: CourseTemplateRowProps) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: { sm: 'center' } }}
    >
      <SelectElement<CourseBatchFormValues>
        name={`templates.${index}.weekday`}
        label="Jour"
        options={WEEKDAY_OPTIONS}
        disabled={disabled}
        sx={{ flex: 1 }}
      />
      <EnumSelectElement<CourseBatchFormValues>
        name={`templates.${index}.type`}
        label="Type"
        values={courseTypeEnum.enumValues}
        labels={COURSE_TYPE_LABELS}
        disabled={disabled}
        sx={{ flex: 1 }}
      />
      <TextFieldElement<CourseBatchFormValues>
        name={`templates.${index}.startTime`}
        label="Heure de début"
        type="time"
        disabled={disabled}
        sx={{ flex: 1 }}
      />
      <TextFieldElement<CourseBatchFormValues>
        name={`templates.${index}.endTime`}
        label="Heure de fin"
        type="time"
        disabled={disabled}
        sx={{ flex: 1 }}
      />
      <TextFieldElement<CourseBatchFormValues>
        name={`templates.${index}.capacity`}
        label="Capacité"
        type="number"
        disabled={disabled}
        sx={{ flex: 1 }}
      />
      <IconButton onClick={onRemove} disabled={disabled} sx={{ alignSelf: { sm: 'center' } }}>
        <Trash2 size={18} />
      </IconButton>
    </Stack>
  );
};

const CourseBatchFields = ({ disabled }: FieldProps) => {
  const { control, setValue } = useFormContext<CourseBatchFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'templates' });
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const count = fields.length * selectedWeeks.length;
  const period =
    selectedWeeks.length > 0
      ? formatMembershipPeriod({
          startsAt: selectedWeeks[0]!,
          endsAt: format(
            addDays(parseISO(selectedWeeks[selectedWeeks.length - 1]!), 6),
            'yyyy-MM-dd',
          ),
        })
      : null;

  return (
    <>
      <EnumSelectElement<CourseBatchFormValues>
        name="visibility"
        label="Visibilité"
        values={courseVisibilityEnum.enumValues}
        labels={COURSE_VISIBILITY_LABELS}
        icons={COURSE_VISIBILITY_ICONS}
        disabled={disabled}
      />
      <Typography variant="h6">Créneaux hebdomadaires</Typography>
      <Stack spacing={2}>
        {fields.map((field, index) => (
          <CourseTemplateRow
            key={field.id}
            index={index}
            disabled={disabled}
            onRemove={() => remove(index)}
          />
        ))}
      </Stack>
      <Button
        variant="outlined"
        startIcon={<Plus size={18} />}
        onClick={() => append(emptyTemplate())}
        disabled={disabled}
      >
        Ajouter un créneau
      </Button>
      <Typography variant="h6">Semaines</Typography>
      <WeekCalendar
        weeks={selectedWeeks}
        onChange={(next) => {
          setSelectedWeeks(next);
          setValue('weeks', next);
        }}
        disabled={disabled}
      />
      {count > 0 && period !== null && (
        <Alert severity="info">
          {count === 1
            ? `1 séance sera créée du ${period}.`
            : `${count} séances seront créées du ${period}.`}
        </Alert>
      )}
    </>
  );
};

export const CourseBatchForm = () => {
  const suggestion = api.course.suggestTemplates.useQuery();

  if (suggestion.isPending || suggestion.error !== null || suggestion.data === undefined) {
    return null;
  }

  return (
    <Form<CreatedCourses, CourseBatchFormValues, typeof courseBatchCreateSchema>
      create={api.course.createBatch}
      schema={courseBatchCreateSchema}
      defaultValues={() => ({
        visibility: 'public',
        templates:
          suggestion.data.length > 0
            ? suggestion.data.map((template) => ({
                ...template,
                capacity: String(template.capacity),
              }))
            : [emptyTemplate()],
        weeks: [],
      })}
      redirectTo={() => '/seances'}
      createdMessage="Séances créées."
      cancelHref="/seances"
    >
      {CourseBatchFields}
    </Form>
  );
};
