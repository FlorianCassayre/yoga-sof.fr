'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { type DefaultValues, type FieldValues, type Resolver, useForm } from 'react-hook-form';
import { FormContainer } from 'react-hook-form-mui';

import { FormShell } from './FormShell';
import type { FormProps, IdVersion, MutationProcedure } from './types';

// Placeholder mutation so the useMutation hook keeps a stable call order when
// no update procedure is provided (create-only forms).
const stubUpdate = <Row, Input>(): MutationProcedure<Row, Input> => ({
  useMutation: () => ({
    mutateAsync: () => {
      throw new Error('Aucune procédure de modification.');
    },
    isPending: false,
    error: null,
  }),
});

// Placeholder mutation so the useMutation hook keeps a stable call order when
// no create procedure is provided (edit-only forms).
const stubCreate = <Row, Input>(): MutationProcedure<Row, Input> => ({
  useMutation: () => ({
    mutateAsync: () => {
      throw new Error('Aucune procédure de création.');
    },
    isPending: false,
    error: null,
  }),
});

type FormFieldsProps<Row, Values extends FieldValues> = Omit<
  FormProps<Row, Values>,
  'id' | 'get'
> & { row: Row | undefined };

export const FormFields = <Row, Values extends FieldValues>({
  row,
  create,
  update,
  schema,
  defaultValues,
  redirectTo,
  createdMessage,
  updatedMessage,
  submitLabel,
  cancelHref,
  children,
}: FormFieldsProps<Row, Values>) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const form = useForm<Values>({
    // The generic Schema parameter blocks zodResolver's inference.
    resolver: schema
      ? (zodResolver(schema as never, undefined, { raw: true }) as unknown as Resolver<Values>)
      : undefined,
    defaultValues: defaultValues(row) as DefaultValues<Values>,
  });
  const createMutation = (create ?? stubCreate<Row, Values>()).useMutation();
  const updateMutation = (update ?? stubUpdate<Row, Values & IdVersion>()).useMutation();
  const Fields = children;

  return (
    <FormContainer<Values>
      formContext={form}
      onSuccess={(values) => {
        (row && update
          ? updateMutation.mutateAsync({
              ...values,
              id: (row as Row & IdVersion).id,
              version: (row as Row & IdVersion).version,
            })
          : createMutation.mutateAsync(values)
        )
          .then(async (saved) => {
            enqueueSnackbar(
              row ? (updatedMessage ?? 'Modifications enregistrées.') : createdMessage,
              {
                variant: 'success',
              },
            );
            await queryClient.invalidateQueries();
            router.push(redirectTo(saved));
          })
          .catch((error: unknown) => {
            enqueueSnackbar(error instanceof Error ? error.message : 'Une erreur est survenue.', {
              variant: 'error',
            });
          });
      }}
    >
      <FormShell
        submitLabel={submitLabel ?? (row ? 'Enregistrer' : 'Créer')}
        submitting={createMutation.isPending || updateMutation.isPending}
        cancelHref={cancelHref}
      >
        <Fields disabled={createMutation.isPending || updateMutation.isPending} row={row} />
      </FormShell>
    </FormContainer>
  );
};
