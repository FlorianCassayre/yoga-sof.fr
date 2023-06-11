import React, { useState } from 'react';
import { Course, User } from '@prisma/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from '@mui/material';
import { displayUserName } from '../../common/display';
import { grey } from '@mui/material/colors';

interface RenableUserDialogProps {
  user: User;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const RenableUserDialog: React.FC<RenableUserDialogProps> = ({ user, open, setOpen, onConfirm }) => {
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
        Réactiver le compte utilisateur
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography paragraph>
            Souhaitez-vous vraiment réactiver le compte utilisateur <strong>{displayUserName(user)}</strong> ?
            Cet utilisateur pourra à nouveau se connecter au site et s'inscrire à des séances.
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
