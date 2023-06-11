import React, { useState } from 'react';
import { Course, User } from '@prisma/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle, TextField,
  Typography
} from '@mui/material';
import { displayCourseName, displayUserName } from '../../common/display';
import { grey } from '@mui/material/colors';

interface DeleteUserDialogProps {
  user: User;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ user, open, setOpen, onConfirm }) => {
  const handleClose = () => {
    setOpen(false);
  };
  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>
        Supprimer le compte utilisateur
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography paragraph>
            Souhaitez-vous vraiment supprimer le compte utilisateur <strong>{displayUserName(user)}</strong> ?
            Cette opération n'est pas réversible.
          </Typography>
          <Typography paragraph>
            Remarquez en outre que la suppression n'est possible à la seule condition que l'utilisateur ne se soit jamais connecté au site, et qu'aucune inscription à des séances n'ait été effectuée dans le passé.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose} sx={{ color: grey[600] }}>Annuler</Button>
        <Button onClick={handleConfirm} autoFocus>
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
