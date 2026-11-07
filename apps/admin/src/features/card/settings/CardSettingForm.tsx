'use client';

import { Button, Stack } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { cardValidUntil } from '@yoga-sof/core';
import { useSnackbar } from 'notistack';
import { useFormContext } from 'react-hook-form';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';

import { api } from '../../../server/api';
import { formatValidUntil } from '../formatValidUntil';

interface CardSettingFormValues {
  validityMonths: string;
}

const CardSettingFields = ({ disabled }: { disabled: boolean }) => {
  const { watch } = useFormContext<CardSettingFormValues>();
  const months = Number(watch('validityMonths'));
  const valid = Number.isInteger(months) && months > 0;
  const validUntil = valid ? cardValidUntil({ purchasedAt: new Date(), months }) : null;

  return (
    <TextFieldElement<CardSettingFormValues>
      name="validityMonths"
      label="Durée de validité (en mois)"
      type="number"
      helperText={
        validUntil ? `Exemple : valable jusqu'au ${formatValidUntil(validUntil)}` : undefined
      }
      slotProps={{ htmlInput: { min: 1, step: 1 } }}
      disabled={disabled}
    />
  );
};

export const CardSettingForm = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const settingQuery = api.cardSetting.get.useQuery();
  const updateMutation = api.cardSetting.update.useMutation();

  if (settingQuery.isPending || settingQuery.error) {
    return null;
  }
  const setting = settingQuery.data;

  return (
    <FormContainer<CardSettingFormValues>
      defaultValues={{ validityMonths: String(setting?.validityMonths ?? 12) }}
      onSuccess={(values) => {
        updateMutation
          .mutateAsync({
            validityMonths: Number(values.validityMonths),
            version: setting?.version,
          })
          .then(async () => {
            enqueueSnackbar('Configuration enregistrée.', { variant: 'success' });
            await queryClient.invalidateQueries();
          })
          .catch((error: unknown) => {
            enqueueSnackbar(error instanceof Error ? error.message : 'Une erreur est survenue.', {
              variant: 'error',
            });
          });
      }}
    >
      <Stack spacing={2}>
        <CardSettingFields disabled={updateMutation.isPending} />
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={updateMutation.isPending}>
            Enregistrer
          </Button>
        </Stack>
      </Stack>
    </FormContainer>
  );
};
