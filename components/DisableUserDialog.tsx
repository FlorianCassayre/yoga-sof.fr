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
import { displayCourseName, displayUserName } from '../lib/common/newDisplay';

interface DisableUserDialogProps {
  user: User;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const DisableUserDialog: React.FC<DisableUserDialogProps> = ({ user, open, setOpen, onConfirm }) => {
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
        Désactiver le compte utilisateur
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography paragraph>
            Souhaitez-vous vraiment désactiver le compte utilisateur <strong>{displayUserName(user)}</strong> ?
            Cet utilisateur ne sera plus en mesure de se connecter au site et son profil n'apparaitra plus dans la liste.
            Vous pourrez le réactiver à tout moment.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose}>Annuler</Button>
        <Button onClick={handleConfirm} autoFocus>
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
