import React, { useMemo } from 'react';
import { Alert, Grid } from '@mui/material';
import { CreditCard } from '@mui/icons-material';
import { CreateFormContent } from '../form';
import { trpc } from '../../../common/trpc';
import { SelectUser } from '../fields/SelectUser';
import { couponCreateSchema } from '../../../common/schemas/coupon';
import { SelectCouponModel } from '../fields/SelectCouponModel';
import { z } from 'zod';
import { useRouter } from 'next/router';
import { InternalLink } from '../../contents/common/InternalLink';

const CouponFormFields = () => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <Alert severity="warning">
        Les cartes peuvent être générées et payées directement depuis le <InternalLink href="/administration/paiements/commandes/creation">formulaire de création de commande</InternalLink>.
      </Alert>
    </Grid>
    <Grid item xs={12}>
      <Alert severity="info">
        Si vous ne choisissez aucun propriétaire vous en deviendrez le propriétaire.
      </Alert>
    </Grid>
    <Grid item xs={12}>
      <SelectCouponModel name="couponModelId" />
    </Grid>
    <Grid item xs={12}>
      <SelectUser name="userId" label="Propriétaire de la carte" />
    </Grid>
  </Grid>
);

const querySchema = z.object({
  couponModelId: z.preprocess(
    (a) => a ? parseInt(z.string().parse(a), 10) : undefined,
    z.number().int().min(0).optional()
  ),
});

export const CouponCreateForm = () => {
  const router = useRouter();
  const actualDefaultValues: { couponModelId?: number } = useMemo(() => {
    const parsed = querySchema.safeParse(router.query);
    if (parsed.success) {
      const { couponModelId } = parsed.data;
      return {
        couponModelId,
      };
    } else {
      return {};
    }
  }, [router]);
  const { coupon } = trpc.useContext();

  return (
    <CreateFormContent
      icon={<CreditCard />}
      defaultValues={actualDefaultValues}
      urlSuccessFor={(data) => `/administration/cartes`}
      urlCancel="/administration/cartes"
      title="Génération d'une carte"
      schema={couponCreateSchema}
      mutationProcedure={trpc.coupon.create}
      successMessage={(data) => `La carte a été générée sous le code ${data.code}.`}
      invalidate={[coupon.find, coupon.findAll]}
    >
      <CouponFormFields />
    </CreateFormContent>
  );
};
