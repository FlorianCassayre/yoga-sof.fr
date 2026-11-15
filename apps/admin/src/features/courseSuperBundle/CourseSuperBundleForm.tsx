'use client';

import { Button, IconButton, Stack } from '@mui/material';
import { centsToEuros, COURSE_TYPE_LABELS, type CourseType, courseTypeEnum } from '@yoga-sof/core';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { TextFieldElement } from 'react-hook-form-mui';

import { Form } from '../../components/form/Form';
import type { FieldProps, MutationProcedure } from '../../components/form/types';
import { EnumSelectElement } from '../../components/input/EnumSelectElement';
import { PriceFieldElement } from '../../components/input/PriceFieldElement';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { courseSuperBundleFormSchema } from './courseSuperBundleFormSchema';

type CourseSuperBundle = NonNullable<RouterOutputs['courseSuperBundle']['get']>;
type CreatedSuperBundle = RouterOutputs['courseSuperBundle']['create'];

interface CourseSuperBundleFormValues {
  label: string;
  price: string;
  bundles: { label: string; type: CourseType | null; price: string; capacity: string }[];
}

const emptyBundle = () => ({ label: '', type: null, price: '', capacity: '' });

const createProcedure: MutationProcedure<CreatedSuperBundle, CourseSuperBundleFormValues> = {
  useMutation: () => {
    const mutation = api.courseSuperBundle.create.useMutation();

    return {
      mutateAsync: (values) => mutation.mutateAsync(courseSuperBundleFormSchema.parse(values)),
      isPending: mutation.isPending,
      error: mutation.error,
    };
  },
};

const BundleRow = ({
  index,
  disabled,
  onRemove,
}: {
  index: number;
  disabled: boolean;
  onRemove: () => void;
}) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: { sm: 'center' } }}
    >
      <TextFieldElement<CourseSuperBundleFormValues>
        name={`bundles.${index}.label`}
        label="Libellé"
        disabled={disabled}
        sx={{ flex: 2 }}
      />
      <EnumSelectElement<CourseSuperBundleFormValues>
        name={`bundles.${index}.type`}
        label="Type"
        values={courseTypeEnum.enumValues}
        labels={COURSE_TYPE_LABELS}
        disabled={disabled}
        sx={{ flex: 1 }}
      />
      <PriceFieldElement<CourseSuperBundleFormValues>
        name={`bundles.${index}.price`}
        label="Prix (€)"
        disabled={disabled}
        sx={{ flex: 1 }}
      />
      <TextFieldElement<CourseSuperBundleFormValues>
        name={`bundles.${index}.capacity`}
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

const CourseSuperBundleFields = ({ disabled, row }: FieldProps<CourseSuperBundle>) => {
  const { control } = useFormContext<CourseSuperBundleFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'bundles' });

  return (
    <>
      <TextFieldElement<CourseSuperBundleFormValues>
        name="label"
        label="Libellé"
        disabled={disabled}
      />
      <PriceFieldElement<CourseSuperBundleFormValues>
        name="price"
        label="Prix (€)"
        disabled={disabled}
      />
      {row === undefined && (
        <Stack spacing={2}>
          {fields.map((field, index) => (
            <BundleRow
              key={field.id}
              index={index}
              disabled={disabled}
              onRemove={() => remove(index)}
            />
          ))}
          <Button
            variant="outlined"
            startIcon={<Plus size={16} />}
            onClick={() => append(emptyBundle())}
            disabled={disabled}
            sx={{ alignSelf: 'start' }}
          >
            Ajouter un lot de séances
          </Button>
        </Stack>
      )}
    </>
  );
};

export const CourseSuperBundleForm = ({ id }: { id?: number }) => {
  return (
    <Form<CourseSuperBundle, CourseSuperBundleFormValues, typeof courseSuperBundleFormSchema>
      id={id}
      get={api.courseSuperBundle.get}
      create={createProcedure}
      update={api.courseSuperBundle.update}
      schema={courseSuperBundleFormSchema}
      defaultValues={(superBundle) =>
        superBundle === undefined
          ? { label: '', price: '', bundles: [emptyBundle()] }
          : {
              label: superBundle.label,
              price: String(centsToEuros(superBundle.price)),
              bundles: [],
            }
      }
      redirectTo={(superBundle) => `/ensembles/${superBundle.id}`}
      createdMessage="Ensemble de lots de séances créé."
      updatedMessage="Ensemble de lots de séances modifié."
      cancelHref={id === undefined ? '/lots' : `/ensembles/${id}`}
    >
      {CourseSuperBundleFields}
    </Form>
  );
};
