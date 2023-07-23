import React from 'react';
import { OtherPaymentCategory } from '@prisma/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { displayOtherPaymentCategoryName } from '../../common/display';
import { grey } from '@mui/material/colors';

interface DeleteOtherPaymentCategoryDialogProps {
  category: OtherPaymentCategory;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteOtherPaymentCategoryDialog: React.FC<DeleteOtherPaymentCategoryDialogProps> = ({ category, open, setOpen, onConfirm }) => {
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
        Supprimer la catégorie de transaction
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Souhaitez-vous vraiment supprimer la catégorie de transaction "{displayOtherPaymentCategoryName(category)}" ?
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
