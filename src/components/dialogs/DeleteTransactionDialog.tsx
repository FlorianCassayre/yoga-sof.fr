import React from 'react';
import { Transaction, User } from '@prisma/client';
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

interface DeleteTransactionDialogProps {
  transaction: Transaction & { user: User };
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteTransactionDialog: React.FC<DeleteTransactionDialogProps> = ({ transaction, open, setOpen, onConfirm }) => {
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
        Confirmer la suppression du paiement
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography paragraph>
            Souhaitez-vous vraiment supprimer le paiement de <strong>{displayTransactionWithUserName(transaction)}</strong> ?
            Cette opération n'est pas réversible.
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
