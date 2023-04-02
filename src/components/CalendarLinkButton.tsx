import React, { useRef, useState } from 'react';
import { Session } from 'next-auth';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField
} from '@mui/material';
import { ContentCopy, Info } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

interface CalendarDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CalendarDialog: React.FC<CalendarDialogProps> = ({ open, setOpen }) => {
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>
        Intégration du calendrier dans une application tierce
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Ce lien est à copier dans votre application de calendrier préférée (<strong>Google Calendar</strong>, <strong>Apple iCloud Calendar</strong>, <strong>Outlook</strong>, ...).
          Vos événements apparaîtront automatiquement dans celui-ci et seront mis à jour quotidiennement avec les dernières informations.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Compris</Button>
      </DialogActions>
    </Dialog>
  );
}

interface CalendarLinkButtonProps {
  publicAccessToken: string;
  coach?: boolean;
}

export const CalendarLinkButton: React.FC<CalendarLinkButtonProps> = ({ publicAccessToken, coach }) => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const url = `${window.location.origin}/api/calendar.ics?token=${publicAccessToken}${coach ? '&coach' : ''}`;
  const ref = useRef<HTMLInputElement>();
  const selectInput = () => {
    if (ref.current) {
      ref.current.select();
    }
  };
  const handleCopy = () => {
    selectInput();
    document.execCommand('copy');
    enqueueSnackbar('Calendrier ICS copié', { autoHideDuration: 2000 });
  };
  const handleInfo = () => setOpen(true);
  return (
    <>
      <CalendarDialog open={open} setOpen={setOpen} />
      <TextField
        value={url}
        label="Intégration du calendrier dans une application tierce"
        InputProps={{
          readOnly: true,
          startAdornment: <IconButton onClick={handleCopy} sx={{ mr: 1.5 }}><ContentCopy /></IconButton>,
          endAdornment: <IconButton onClick={handleInfo}><Info /></IconButton>,
        }}
        inputProps={{ style: { color: 'grey' } }}
        fullWidth
        inputRef={ref}
      />
    </>
  );
};
