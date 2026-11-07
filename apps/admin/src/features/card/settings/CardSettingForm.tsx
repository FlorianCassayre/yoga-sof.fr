'use client';

import { Button, Stack } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { cardValidUntil } from '@yoga-sof/core';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';

import { api } from '../../../server/api';
import { formatValidUntil } from '../formatValidUntil';

interface CardSettingFormValues {
  validityMonths: string;
}

const MAX_MONTHS = 120;

const CardSettingFields = ({ disabled }: { disabled: boolean }) => {
  const settingQuery = api.cardSetting.get.useQuery();
  const { setValue } = useFormContext<CardSettingFormValues>();
  const [months, setMonths] = useState<number>(settingQuery.data?.validityMonths ?? 12);
  const valid = Number.isInteger(months) && months >= 1 && months <= MAX_MONTHS;
  const validUntil = valid ? cardValidUntil({ purchasedAt: new Date(), months }) : null;

  return (
    <TextFieldElement<CardSettingFormValues>
      name="validityMonths"
      label="Durée de validité (en mois)"
      type="number"
      onChange={(event) => {
        const raw = event.target.value;
        if (raw === '') {
          setMonths(0);
          return;
        }
        const clamped = String(Math.min(Math.floor(Number(raw)), MAX_MONTHS));
        setValue('validityMonths', clamped);
        setMonths(Number(clamped));
      }}
      helperText={
        validUntil ? `Exemple : valable jusqu'au ${formatValidUntil(validUntil)}` : undefined
      }
      rules={{
        validate: (value: string) => {
          const months = Number(value);

          return Number.isInteger(months) && months >= 1 && months <= MAX_MONTHS
            ? true
            : 'La durée de validité doit être comprise entre 1 et 120 mois.';
        },
      }}
      slotProps={{ htmlInput: { min: 1, max: MAX_MONTHS, step: 1 } }}
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
