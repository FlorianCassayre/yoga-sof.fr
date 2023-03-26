import React, { useMemo } from 'react';
import { Alert, Grid } from '@mui/material';
import { Groups } from '@mui/icons-material';
import { CreateFormContent } from '../form';
import { trpc } from '../../../common/trpc';
import { z } from 'zod';
import { useRouter } from 'next/router';
import { SelectMembershipModel } from '../fields/SelectMembershipModel';
import { membershipCreateLegacySchema } from '../../../common/schemas/membership';
import { MembershipType } from '@prisma/client';
import { SelectUser } from '../fields/SelectUser';
import { DatePickerElement } from 'react-hook-form-mui';

const MembershipFormFields = () => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <Alert severity="info">
        L'adhésion dure un an ; vous pouvez choisir la date de début qui est définie par défaut comme étant le jour courant.
      </Alert>
    </Grid>
    <Grid item xs={12}>
      <SelectMembershipModel name="membershipModelId" />
    </Grid>
    <Grid item xs={12}>
      <SelectUser name="users" multiple />
    </Grid>
    <Grid item xs={12}>
      <DatePickerElement name="dateStart" label="Date de début de l'adhésion" inputProps={{ fullWidth: true }} />
    </Grid>
  </Grid>
);

const querySchema = z.object({
  membershipModelId: z.preprocess(
    (a) => a ? String(a) : undefined,
    z.nativeEnum(MembershipType)
  ),
});

const defaultValues = {
  dateStart: new Date(),
  users: [],
};

export const MembershipCreateForm = () => {
  const router = useRouter();
  const actualDefaultValues: { membershipModelId?: MembershipType, users: number[] } = useMemo(() => {
    const parsed = querySchema.safeParse(router.query);
    if (parsed.success) {
      const { membershipModelId } = parsed.data;
      return {
        ...defaultValues,
        membershipModelId,
      };
    } else {
      return defaultValues;
    }
  }, [router]);
  const { membership } = trpc.useContext();

  return (
    <CreateFormContent
      icon={<Groups />}
      defaultValues={actualDefaultValues}
      urlSuccessFor={(data) => `/administration/adhesions`}
      urlCancel="/administration/adhesions"
      title="Création d'une ou plusieurs adhésions"
      schema={membershipCreateLegacySchema}
      mutationProcedure={trpc.membership.create}
      successMessage={(data) => `La ou les adhésions ont été enregistrées.`}
      invalidate={[membership.find, membership.findAll]}
    >
      <MembershipFormFields />
    </CreateFormContent>
  );
};
