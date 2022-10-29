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
import { trpc } from '../lib/common/trpc';
import { CourseModel } from '@prisma/client';
import { CourseTypeNames } from '../lib/common/newCourse';
import { AddBox, AutoAwesomeMotion, Create, Delete, Edit, Event } from '@mui/icons-material';
import { formatColonTimeHHhMM, WeekdayNames } from '../lib/common/newDate';
import Link from 'next/link';

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
  const { invalidateQueries } = trpc.useContext();

  const { mutate: mutateDelete, isLoading: isDeleting } = trpc.useMutation('courseModel.delete', {
    onSuccess: async () => {
      await Promise.all([invalidateQueries('courseModel.get'), invalidateQueries('courseModel.getAll')]);
    },
  }); // TODO onError

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
  <Grid item xs={12} sm={6} lg={4} xl={3}>
    {children}
  </Grid>
);

interface NewCourseModelCardsProps {
  readOnly?: boolean;
}

export const CourseModelCards: React.FC<NewCourseModelCardsProps> = ({ readOnly }) => {
  const { data, isError, isLoading } = trpc.useQuery(['courseModel.getAll']);

  const defaultHeight = 150;

  return (
    <Grid container spacing={2}>
      {data ? (
          <>
            {data.map((courseModel) =>
              <GridItem key={courseModel.id}>
                <CourseModelCard courseModel={courseModel} readOnly={readOnly} />
              </GridItem>
            )}
            {!readOnly && (
              <GridItem>
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: defaultHeight, p: 2, border: '1px dashed lightgrey', borderRadius: 1 }}>
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
