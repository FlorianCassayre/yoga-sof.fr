import React from 'react';
import {
  IconButton,
  Stack, Tooltip,
  Typography
} from '@mui/material';
import { trpc } from '../common/trpc';
import { CouponModel } from '@prisma/client';
import { AddCard, CardGiftcard } from '@mui/icons-material';
import { ModelCards } from './ModelCards';
import { useRouter } from 'next/router';
import { CourseTypeNames } from '../common/course';

export const CouponModelCards: React.FC = () => {
  const router = useRouter();
  const trpcClient = trpc.useContext();

  return (
    <ModelCards
      procedureFindAll={trpc.couponModel.findAll}
      procedureDelete={trpc.couponModel.delete}
      deleteInvalidate={[trpcClient.couponModel.find, trpcClient.couponModel.findAll]}
      urlEditFor={({ id }) => `/administration/cartes/types/${id}/edition`}
      urlCreate="/administration/cartes/types/creation"
      createLabel="Nouveau type"
      skeletonCardHeight={130}
      renderCardContent={({ courseType, quantity, price }: CouponModel) => (
        <>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <CardGiftcard />
            <Typography variant="h5" component="div">
              Carte
              {' '}
              {CourseTypeNames[courseType].toLowerCase()}
            </Typography>
          </Stack>
          <Typography color="text.secondary">
            <strong>{price} €</strong> par carte de <strong>{quantity}</strong> séance{quantity > 1 ? 's' : ''}
          </Typography>
        </>
      )}
      renderAdditionalActions={({ id }: CouponModel, disabled) => (
        <Tooltip title="Générer une carte">
          <IconButton size="small" disabled={disabled} onClick={() => router.push({ pathname: '/administration/cartes/emises/creation', query: { couponModelId: id } })}><AddCard /></IconButton>
        </Tooltip>
      )}
    />
  );
};
