import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Grid,
  IconButton,
  Skeleton, Tooltip
} from '@mui/material';
import { AddBox, Delete, Edit } from '@mui/icons-material';
import Link from 'next/link';
import { useSnackbar } from 'notistack';
import { Procedure, ProcedureParams } from '@trpc/server/src/core/procedure';
import { AnyRootConfig } from '@trpc/server/src/core/internals/config';
import { DecorateProcedure } from '@trpc/react-query/shared';
import { useRouter } from 'next/router';
import { ConvertInput, InputIdentifier, ProcedureQueryArray } from '../server/controllers/types';

type ProcedureMutateIdentifier = Procedure<'mutation', ProcedureParams<AnyRootConfig, unknown, InputIdentifier, unknown, unknown, unknown, unknown>>;

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

interface ModelCard<T extends InputIdentifier, TProcedureDelete extends ProcedureMutateIdentifier> {
  data: ConvertInput<T>;
  procedureDelete: DecorateProcedure<TProcedureDelete, any, any>;
  deleteInvalidate: { invalidate: () => Promise<void> }[];
  renderCardContent: (data: ConvertInput<T>) => React.ReactNode;
  renderAdditionalActions?: (data: ConvertInput<T>, disabled: boolean) => React.ReactNode;
  urlEditFor: (data: InputIdentifier) => string;
  readOnly?: boolean;
}

const ModelCard = <T extends InputIdentifier, TProcedureDelete extends ProcedureMutateIdentifier>({
  data,
  procedureDelete,
  deleteInvalidate,
  renderCardContent,
  renderAdditionalActions,
  urlEditFor,
  readOnly,
}: ModelCard<T, TProcedureDelete>): React.ReactElement => {
  const { id } = data;
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const { mutate: mutateDelete, isLoading: isDeleting } = procedureDelete.useMutation({
    onSuccess: async () => {
      await Promise.all(deleteInvalidate.map(procedure => procedure.invalidate()));
      enqueueSnackbar(`Le modèle a été supprimé.`, { variant: 'success' })
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de la suppression du modèle`, { variant: 'error' });
    }
  });

  const [isDeleteOpen, setDeleteOpen] = useState(false);

  const disabled = isDeleting;

  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: 0 }}>
        {renderCardContent(data)}
      </CardContent>
      {!readOnly && (
        <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {renderAdditionalActions && renderAdditionalActions(data, disabled)}
          <Tooltip title="Supprimer">
            <IconButton size="small" onClick={() => setDeleteOpen(true)} disabled={disabled}><Delete /></IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton size="small" disabled={disabled} onClick={() => router.push(urlEditFor({ id }))}><Edit /></IconButton>
          </Tooltip>
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

interface ModelCardsProps<T extends InputIdentifier, TProcedureFindAll extends ProcedureQueryArray<T>, TProcedureDelete extends ProcedureMutateIdentifier> extends Omit<ModelCard<T, TProcedureDelete>, 'data'> {
  procedureFindAll: DecorateProcedure<TProcedureFindAll, any, any>;
  urlCreate: string;
  createLabel: string;
  skeletonCardHeight: number;
}

export const ModelCards = <T extends InputIdentifier, TProcedureFindAll extends ProcedureQueryArray<T>, TProcedureDelete extends ProcedureMutateIdentifier>({
  procedureFindAll,
  procedureDelete,
  deleteInvalidate,
  renderCardContent,
  renderAdditionalActions,
  urlEditFor,
  urlCreate,
  createLabel,
  readOnly,
  skeletonCardHeight,
}: ModelCardsProps<T, TProcedureFindAll, TProcedureDelete>): React.ReactElement => {
  const { data, isError, isLoading } = procedureFindAll.useQuery(undefined);

  return (
    <Grid container spacing={2}>
      {data ? (
          <>
            {data
              .map((model) =>
              <GridItem key={model.id}>
                <ModelCard data={model} {...{ procedureDelete, deleteInvalidate, renderCardContent, renderAdditionalActions, urlEditFor, readOnly }} />
              </GridItem>
            )}
            {!readOnly && (
              <GridItem>
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: skeletonCardHeight, height: '100%', p: 0, border: '1px dashed lightgrey', borderRadius: 1 }}>
                  <Link href={urlCreate} passHref>
                    <Button startIcon={<AddBox />} sx={{ width: '100%', height: '100%' }}>{createLabel}</Button>
                  </Link>
                </Box>
              </GridItem>
            )}
          </>
        )
        : isLoading ? (
          [0, 1].map(i => (
            <GridItem key={i}>
              <Skeleton variant="rounded" height={skeletonCardHeight} />
            </GridItem>
          ))
        ) : isError && (
          <Alert severity="error">Une erreur est survenue lors de la récupération des modèles</Alert>
        )}
    </Grid>
  );
};
