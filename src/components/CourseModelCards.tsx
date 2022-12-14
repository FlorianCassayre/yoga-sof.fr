import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Typography
} from '@mui/material';
import { trpc } from '../common/trpc';
import { CourseModel } from '@prisma/client';
import { CourseTypeNames } from '../common/course';
import { AddBox, AutoAwesomeMotion, Delete, Edit, Event } from '@mui/icons-material';
import { formatColonTimeHHhMM, WeekdayNames } from '../common/date';
import Link from 'next/link';
import { useSnackbar } from 'notistack';
import { QueryKey } from '../server/controllers';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteDialog: React.FunctionComponent<ConfirmDeleteDialogProps> = ({ open, onCancel, onConfirm }) => (
  <Dialog
    open={open}
    onClose={onCancel}
  >
    <DialogTitle>
      Confirmer la suppression
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        Souhaitez-vous vraiment supprimer ce modèle ?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} color="inherit">Annuler</Button>
      <Button onClick={onConfirm}>
        Supprimer
      </Button>
    </DialogActions>
  </Dialog>
);

interface CourseModelCard {
  courseModel: CourseModel;
  readOnly?: boolean;
}

const CourseModelCard: React.FC<CourseModelCard> = ({ courseModel: { id, type, weekday, timeStart, timeEnd, slots, price, bundle }, readOnly }) => {
  const { invalidate } = trpc.useContext();
  const { enqueueSnackbar } = useSnackbar();

  const { mutate: mutateDelete, isLoading: isDeleting } = trpc.courseModelDelete.useMutation({
    onSuccess: async () => {
      await Promise.all((['courseModel.find', 'courseModel.findAll'] as QueryKey[]).map(query => invalidate(query)));
      enqueueSnackbar(`Le modèle a été supprimé.`, { variant: 'success' })
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de la suppression du modèle de séance`, { variant: 'error' });
    }
  });

  const [isDeleteOpen, setDeleteOpen] = useState(false);

  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: 0 }}>
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
      </CardContent>
      {!readOnly && (
        <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton size="small" aria-label="Supprimer" onClick={() => setDeleteOpen(true)} disabled={isDeleting}><Delete /></IconButton>
          <Link href={`/administration/seances/modeles/${id}/edition`} passHref>
            <IconButton size="small" aria-label="Modifier" disabled={isDeleting}><Edit /></IconButton>
          </Link>
        </CardActions>
      )}

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          mutateDelete({ id });
      }}
      />
    </Card>
  );
}

const GridItem: React.FC = ({ children }) => (
  <Grid item xs={12} sm={6} lg={4} xl={3} alignItems="stretch">
    {children}
  </Grid>
);

interface CourseModelCardsProps {
  readOnly?: boolean;
}

export const CourseModelCards: React.FC<CourseModelCardsProps> = ({ readOnly }) => {
  const { data, isError, isLoading } = trpc.courseModelFindAll.useQuery();

  const defaultHeight = 180;

  return (
    <Grid container spacing={2}>
      {data ? (
          <>
            {data
              .sort(({ weekday: weekday1, timeStart: timeStart1 }, { weekday: weekday2, timeStart: timeStart2 }) =>
                weekday1 === weekday2 ? (timeStart1 < timeStart2 ? -1 : 1) : weekday1 - weekday2
              )
              .map((courseModel) =>
              <GridItem key={courseModel.id}>
                <CourseModelCard courseModel={courseModel} readOnly={readOnly} />
              </GridItem>
            )}
            {!readOnly && (
              <GridItem>
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: defaultHeight, height: '100%', p: 2, border: '1px dashed lightgrey', borderRadius: 1 }}>
                  <Link href="/administration/seances/modeles/creation" passHref>
                    <Button startIcon={<AddBox />}>Nouveau modèle</Button>
                  </Link>
                </Box>
              </GridItem>
            )}
          </>
        )
        : isLoading ? (
          [0, 1].map(i => (
            <GridItem key={i}>
              <Skeleton variant="rounded" height={defaultHeight} />
            </GridItem>
          ))
        ) : (
          <>
            error
          </>
        )}
    </Grid>
  );
};
