import React from 'react';
import { Prisma } from '@prisma/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { displayCourseName, displayUserName } from '../../common/display';
import { grey } from '@mui/material/colors';

interface CancelCourseRegistrationDialogProps {
  courseRegistration: Prisma.CourseRegistrationGetPayload<{ include: { course: true, user: true } }>;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const CancelCourseRegistrationDialog: React.FC<CancelCourseRegistrationDialogProps> = ({ courseRegistration, open, setOpen, onConfirm }) => {
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
        Confirmer la désinscription de l'utilisateur à une séance
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Souhaitez-vous vraiment désinscrire l'utilisateur <strong>{displayUserName(courseRegistration.user)}</strong> de la <strong>{displayCourseName(courseRegistration.course, false)}</strong> ?
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
