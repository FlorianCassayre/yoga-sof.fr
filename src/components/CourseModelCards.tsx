import React from 'react';
import {
  Chip, IconButton,
  Stack, Tooltip,
  Typography
} from '@mui/material';
import { trpc } from '../common/trpc';
import { CourseModel } from '@prisma/client';
import { CourseTypeNames } from '../common/course';
import { AutoAwesomeMotion, DateRange, Edit, Event } from '@mui/icons-material';
import { formatColonTimeHHhMM, WeekdayNames } from '../common/date';
import { ModelCards } from './ModelCards';
import { useRouter } from 'next/router';

interface CourseModelCardsProps {
  readOnly?: boolean;
}

export const CourseModelCards: React.FC<CourseModelCardsProps> = ({ readOnly }) => {
  const router = useRouter();
  const trpcClient = trpc.useContext();

  return (
    <ModelCards
      procedureFindAll={trpc.courseModel.findAll}
      procedureDelete={trpc.courseModel.delete}
      deleteInvalidate={[trpcClient.courseModel.find, trpcClient.courseModel.findAll]}
      urlEditFor={({ id }) => `/administration/seances/modeles/${id}/edition`}
      urlCreate="/administration/seances/modeles/creation"
      createLabel="Nouveau modèle"
      skeletonCardHeight={180}
      readOnly={readOnly}
      renderCardContent={({ type, weekday, timeStart, timeEnd, slots, price, bundle }: CourseModel) => (
        <>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Event />
            <Typography variant="h5" component="div">
              {CourseTypeNames[type]}
            </Typography>
            {bundle && <Chip icon={<AutoAwesomeMotion />} label="Lot" />}
          </Stack>
          <Typography color="text.secondary">
            Le <strong>{WeekdayNames[weekday].toLowerCase()}</strong> de <strong>{formatColonTimeHHhMM(timeStart)}</strong> à <strong>{formatColonTimeHHhMM(timeEnd)}</strong>
          </Typography>
          <Typography color="text.secondary">
            <strong>{slots}</strong> place{slots > 1 && 's'}
          </Typography>
          <Typography color="text.secondary">
            <strong>{price} €</strong> par séance
          </Typography>
        </>
      )}
      renderAdditionalActions={({ id, bundle }: CourseModel, disabled) => !bundle && (
        <Tooltip title="Planifier des séances">
          <IconButton size="small" disabled={disabled} onClick={() => router.push({ pathname: '/administration/seances/planning/creation', query: { modelId: id } })}><DateRange /></IconButton>
        </Tooltip>
      )}
    />
  );
};
