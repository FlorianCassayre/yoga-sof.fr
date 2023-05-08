import React from 'react';
import { Order, User } from '@prisma/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle, Typography
} from '@mui/material';
import { displayUserName } from '../common/display';
import { grey } from '@mui/material/colors';
import { formatDateDDsmmYYYY } from '../common/date';

interface DeleteOrderDialogProps {
  order: Pick<Order, 'date'> & { user: Parameters<typeof displayUserName>[0] };
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteOrderDialog: React.FC<DeleteOrderDialogProps> = ({ order, open, setOpen, onConfirm }) => {
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
        Supprimer le paiement
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography paragraph>
            Souhaitez-vous vraiment supprimer le paiement du <strong>{formatDateDDsmmYYYY(order.date)}</strong> de l'utilisateur <strong>{displayUserName(order.user)}</strong> ?
            Après la suppression tous les articles seront à nouveau marqués comme impayés.
            Cette opération n'est pas réversible, cependant les données supprimées seront tout de même conservées.
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
