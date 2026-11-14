'use client';

import { Alert, Button, IconButton, Stack, Typography } from '@mui/material';
import {
  centsToEuros,
  COURSE_TYPE_LABELS,
  COURSE_VISIBILITY_LABELS,
  courseTypeEnum,
  courseVisibilityEnum,
  formatMembershipPeriod,
  formatPrice,
  type Weekday,
  WEEKDAYS,
} from '@yoga-sof/core';
import { addDays, format, parseISO } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { SelectElement, TextFieldElement } from 'react-hook-form-mui';

import { Form } from '../../components/form/Form';
import type { FieldProps, MutationProcedure } from '../../components/form/types';
import { AsyncAutocompleteElement } from '../../components/input/AsyncAutocompleteElement';
import { EnumSelectElement } from '../../components/input/EnumSelectElement';
import { PriceFieldElement } from '../../components/input/PriceFieldElement';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { WeekCalendar } from './batch/WeekCalendar';
import {
  courseBatchFormSchema,
  type CourseBatchFormValues,
  type CourseBundleOption,
} from './courseBatchFormSchema';
import { COURSE_VISIBILITY_ICONS } from './visibility/courseVisibilityIcons';

type CreatedCourses = RouterOutputs['course']['createBatch'];
type CourseBundleRow = RouterOutputs['courseBundle']['get'];

const weekdayLabel = (weekday: Weekday): string => {
  const label = WEEKDAYS[weekday] ?? '';

  return label.charAt(0).toUpperCase() + label.slice(1);
};

const WEEKDAY_OPTIONS = [1, 2, 3, 4, 5, 6, 0].map((weekday) => ({
  id: weekday,
  label: weekdayLabel(weekday as Weekday),
}));

const emptyTemplate = (): CourseBatchFormValues['templates'][number] => ({
  weekday: 1,
  type: null,
  startTime: '09:00',
  endTime: '11:00',
  capacity: '',
  price: '',
});

interface CourseTemplateRowProps {
  index: number;
  disabled: boolean;
  showPricing: boolean;
  onRemove: () => void;
}

const CourseTemplateRow = ({ index, disabled, showPricing, onRemove }: CourseTemplateRowProps) => {
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
      {showPricing && (
        <>
          <EnumSelectElement<CourseBatchFormValues>
            name={`templates.${index}.type`}
            label="Type"
            values={courseTypeEnum.enumValues}
            labels={COURSE_TYPE_LABELS}
            disabled={disabled}
            sx={{ flex: 1 }}
          />
          <PriceFieldElement<CourseBatchFormValues>
            name={`templates.${index}.price`}
            label="Prix (€)"
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
        </>
      )}
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
      <IconButton onClick={onRemove} disabled={disabled} sx={{ alignSelf: { sm: 'center' } }}>
        <Trash2 size={18} />
      </IconButton>
    </Stack>
  );
};

const CourseBatchFields = ({ disabled }: FieldProps) => {
  const { control, setValue } = useFormContext<CourseBatchFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'templates' });
  const bundle = useWatch({ control, name: 'bundle' });
  const showPricing = bundle == null;
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
      <AsyncAutocompleteElement<CourseBundleOption, CourseBatchFormValues>
        name="bundle"
        label="Lot de séances"
        list={api.courseBundle.list}
        sort={{ field: 'label', sort: 'asc' }}
        getOptionLabel={(option) => option.label}
        preload
        disabled={disabled}
        helperText={
          bundle == null
            ? undefined
            : `Les séances héritent du type et du prix du lot (${COURSE_TYPE_LABELS[bundle.type].toLowerCase()}, ${formatPrice(bundle.price)}).`
        }
      />
      {bundle != null && (
        <TextFieldElement<CourseBatchFormValues>
          name="capacity"
          label="Capacité du lot"
          type="number"
          disabled={disabled}
        />
      )}
      <Typography variant="h6">Créneaux hebdomadaires</Typography>
      <Stack spacing={2}>
        {fields.map((field, index) => (
          <CourseTemplateRow
            key={field.id}
            index={index}
            disabled={disabled}
            showPricing={showPricing}
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

const createProcedure: MutationProcedure<CreatedCourses, CourseBatchFormValues> = {
  useMutation: () => {
    const mutation = api.course.createBatch.useMutation();

    return {
      mutateAsync: (values) => mutation.mutateAsync(courseBatchFormSchema.parse(values)),
      isPending: mutation.isPending,
      error: mutation.error,
    };
  },
};

export const CourseBatchForm = ({ presetBundle }: { presetBundle?: CourseBundleRow }) => {
  const suggestion = api.course.suggestTemplates.useQuery();

  if (suggestion.isPending || suggestion.error !== null || suggestion.data === undefined) {
    return null;
  }
  const bundle: CourseBundleOption | null = presetBundle ?? null;

  return (
    <Form<CreatedCourses, CourseBatchFormValues, typeof courseBatchFormSchema>
      create={createProcedure}
      schema={courseBatchFormSchema}
      defaultValues={() => ({
        visibility: 'public',
        bundle,
        capacity: bundle === null ? '' : String(bundle.capacity),
        templates:
          bundle === null && suggestion.data.length > 0
            ? suggestion.data.map((template) => ({
                weekday: template.weekday,
                type: template.type,
                startTime: template.startTime,
                endTime: template.endTime,
                capacity: template.capacity === null ? '' : String(template.capacity),
                price: template.price === null ? '' : String(centsToEuros(template.price)),
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
