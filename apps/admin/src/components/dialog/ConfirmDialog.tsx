'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import type { ReactNode } from 'react';

import type { MutationProcedure } from '../form/types';

interface ConfirmDialogProps<Row, Input> {
  procedure: MutationProcedure<Row, Input>;
  input: Input;
  title: string;
  message: string;
  confirmLabel: string;
  successMessage: string;
  onClose: () => void;
  children?: ReactNode;
}

export const ConfirmDialog = <Row, Input>({
  procedure,
  input,
  title,
  message,
  confirmLabel,
  successMessage,
  onClose,
  children,
}: ConfirmDialogProps<Row, Input>) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const mutation = procedure.useMutation();

  const confirm = () => {
    mutation
      .mutateAsync(input)
      .then(async () => {
        enqueueSnackbar(successMessage, { variant: 'success' });
        await queryClient.invalidateQueries();
      })
      .catch((error: unknown) => {
        enqueueSnackbar(error instanceof Error ? error.message : 'Une erreur est survenue.', {
          variant: 'error',
        });
      })
      .finally(onClose);
  };

  return (
    <Dialog open onClose={mutation.isPending ? undefined : onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Annuler
        </Button>
        <Button onClick={confirm} color="error" variant="contained" disabled={mutation.isPending}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
