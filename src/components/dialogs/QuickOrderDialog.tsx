import React from 'react';
import { Course, CourseRegistration, Order, Transaction, User } from '@prisma/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from '@mui/material';
import { displayTransactionWithUserName } from '../../common/display';
import { grey } from '@mui/material/colors';

interface QuickOrderDialogProps {
  courseRegistration: CourseRegistration & { user: User } & { course: Course };
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const QuickOrderDialog: React.FC<QuickOrderDialogProps> = ({ courseRegistration, open, setOpen, onConfirm }) => {
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
        Payer une séance à partir d'une carte
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography>
            Ce bouton vous permet de créer automatiquement un paiement à transaction nulle à partir d'une séance pour un utilisateur, en utilisant une carte.
            Ceci ne fonctionne que si l'utilisateur possède une carte en cours de validité.
            L'utilisateur ne recevra pas d'email de confirmation contenant la facture.
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
