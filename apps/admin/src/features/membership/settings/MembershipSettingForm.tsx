'use client';

import { Button, Stack } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { formatMembershipPeriod, membershipSeasonPeriod, MONTHS } from '@yoga-sof/core';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { FormContainer, SelectElement } from 'react-hook-form-mui';

import { api } from '../../../server/api';

interface MembershipSettingFormValues {
  seasonStartMonth: string;
}

const MONTH_OPTIONS = MONTHS.map((month, index) => ({
  id: String(index + 1),
  label: month.charAt(0).toUpperCase() + month.slice(1),
}));

const MembershipSettingFields = () => {
  const settingQuery = api.membershipSetting.get.useQuery();
  const [month, setMonth] = useState<number>(settingQuery.data?.seasonStartMonth ?? 9);
  const period = membershipSeasonPeriod({ year: new Date().getFullYear(), month });

  return (
    <SelectElement<MembershipSettingFormValues>
      name="seasonStartMonth"
      label="Mois de début de saison"
      options={MONTH_OPTIONS}
      onChange={(value: unknown) => setMonth(Number(value))}
      helperText={`Exemple : ${formatMembershipPeriod(period)}`}
    />
  );
};
export const MembershipSettingForm = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const settingQuery = api.membershipSetting.get.useQuery();
  const updateMutation = api.membershipSetting.update.useMutation();

  if (settingQuery.isPending || settingQuery.error) {
    return null;
  }
  const setting = settingQuery.data;

  return (
    <FormContainer<MembershipSettingFormValues>
      defaultValues={{
        seasonStartMonth: String(setting?.seasonStartMonth ?? 9),
      }}
      onSuccess={(values) => {
        updateMutation
          .mutateAsync({
            seasonStartMonth: Number(values.seasonStartMonth),
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
        <MembershipSettingFields />
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={updateMutation.isPending}>
            Enregistrer
          </Button>
        </Stack>
      </Stack>
    </FormContainer>
  );
};
