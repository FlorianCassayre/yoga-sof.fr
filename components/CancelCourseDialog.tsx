import React, { useState } from 'react';
import { Course } from '@prisma/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle, TextField,
  Typography
} from '@mui/material';
import { displayCourseName } from '../lib/common/newDisplay';

interface CancelCourseDialogProps {
  course: Course;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: (reason: string | null) => void;
}

export const CancelCourseDialog: React.FC<CancelCourseDialogProps> = ({ course, open, setOpen, onConfirm }) => {
  const [reason, setReason] = useState('');
  const handleClose = () => {
    setOpen(false);
  };
  const handleConfirm = () => {
    const reasonTrimmed = reason.trim();
    onConfirm(reasonTrimmed ? reasonTrimmed : null);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>
        Confirmer l'annulation de la séance
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography paragraph>
            Souhaitez-vous vraiment annuler la séance de {displayCourseName(course, false)} ?
            Vous ne serez plus en mesure de rouvrir les inscriptions pour cette séance.
          </Typography>
          <Typography paragraph>
            Vous pouvez optionnellement indiquer un motif, qui sera transmis aux personnes inscrites.
          </Typography>
          <TextField label="Motif" value={reason} onChange={e => setReason(e.target.value)} fullWidth />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose}>Ignorer</Button>
        <Button onClick={handleConfirm} autoFocus>
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
