'use client';

import { Button, Stack } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';

import { api } from '../../server/api';

const DAY_START_DEFAULT = '09:00';
const DAY_END_DEFAULT = '21:00';

interface CalendarSettingFormValues {
  dayEndsAt: string;
  dayStartsAt: string;
}

const CalendarSettingFields = ({ disabled }: { disabled: boolean }) => {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextFieldElement<CalendarSettingFormValues>
        name="dayStartsAt"
        label="Début de la journée"
        type="time"
        slotProps={{ htmlInput: { step: 3600 } }}
        sx={{ flex: 1 }}
        disabled={disabled}
      />
      <TextFieldElement<CalendarSettingFormValues>
        name="dayEndsAt"
        label="Fin de la journée"
        type="time"
        slotProps={{ htmlInput: { step: 3600 } }}
        sx={{ flex: 1 }}
        disabled={disabled}
      />
    </Stack>
  );
};

export const CalendarSettingForm = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const settingQuery = api.calendarSetting.get.useQuery();
  const updateMutation = api.calendarSetting.update.useMutation();

  if (settingQuery.isPending || settingQuery.error) {
    return null;
  }
  const setting = settingQuery.data;

  return (
    <FormContainer<CalendarSettingFormValues>
      defaultValues={{
        dayStartsAt: setting?.dayStartsAt.slice(0, 5) ?? DAY_START_DEFAULT,
        dayEndsAt: setting?.dayEndsAt.slice(0, 5) ?? DAY_END_DEFAULT,
      }}
      onSuccess={(values) => {
        updateMutation
          .mutateAsync({
            dayStartsAt: values.dayStartsAt,
            dayEndsAt: values.dayEndsAt,
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
        <CalendarSettingFields disabled={updateMutation.isPending} />
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={updateMutation.isPending}>
            Enregistrer
          </Button>
        </Stack>
      </Stack>
    </FormContainer>
  );
};
