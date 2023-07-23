import React from 'react';
import { OtherPayment } from '@prisma/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { displayOtherPaymentName } from '../../common/display';
import { grey } from '@mui/material/colors';

interface DeleteOtherPaymentDialogProps {
  otherPayment: OtherPayment;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteOtherPaymentDialog: React.FC<DeleteOtherPaymentDialogProps> = ({ otherPayment, open, setOpen, onConfirm }) => {
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
        Supprimer la transaction
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Souhaitez-vous vraiment supprimer la {displayOtherPaymentName(otherPayment, false)} ?
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
