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
import { displayCourseName } from '../common/display';
import { grey } from '@mui/material/colors';

interface FrontsiteCancelCourseRegistrationDialogProps {
  courseRegistration: Prisma.CourseRegistrationGetPayload<{ include: { course: true } }>;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const FrontsiteCancelCourseRegistrationDialog: React.FC<FrontsiteCancelCourseRegistrationDialogProps> = ({ courseRegistration, open, setOpen, onConfirm }) => {
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
        Confirmer la désinscription de la séance
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Souhaitez-vous vraiment vous désinscrire de la <strong>{displayCourseName(courseRegistration.course, false)}</strong> ?
          Vous pourrez à tout moment vous y réinscrire, sous réserve qu'il reste de la place.
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
