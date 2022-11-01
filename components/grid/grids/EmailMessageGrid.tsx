import React, { useState } from 'react';
import { GridColumns } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Dialog, DialogContent, DialogTitle, Grid, IconButton, TextField, Typography } from '@mui/material';
import { Close, Visibility } from '@mui/icons-material';
import { GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { EmailMessage } from '@prisma/client';

interface EmailDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  data: EmailMessage;
}

const EmailDetailsDialog: React.FunctionComponent<EmailDetailsDialogProps> = ({ open, onClose, data }) => {
  return (
    <div>
      <Dialog
        onClose={onClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle>
          Détails de l'e-mail
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <TextField label="Destinataire" variant="outlined" value={data.destinationAddress} disabled fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Date d'envoi" variant="outlined" value={data.sentAt} disabled fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Objet" variant="outlined" value={data.subject} disabled fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Message" variant="outlined" value={data.message} disabled fullWidth multiline />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const EmailMessageGrid: React.FunctionComponent = () => {
  const [open, setOpen] = useState(false);
  const [dialogData, setDialogData] = useState<EmailMessage | null>(null);

  const handleDialogOpen = (row: EmailMessage) => {
    setDialogData(row);
    setOpen(true);
  };

  const columns: GridColumns = [
    {
      field: 'details',
      type: 'actions',
      minWidth: 50,
      getActions: ({ row }: GridRowParams) => [
        <GridActionsCellItem icon={<Visibility />} label="Consulter" onClick={() => handleDialogOpen(row)} />,
      ],
    },
    {
      field: 'type',
      headerName: `Type d'e-mail`
    },
    {
      field: 'user',
      headerName: 'Utilisateur',
      renderCell: () => null,
    },
    {
      field: 'destinationAddress',
      headerName: 'Addresse de destination',
    },
    {
      field: 'subject',
      headerName: 'Subject',
    },
    {
      field: 'message',
      headerName: 'Longueur du message',
      valueFormatter: ({ value }) => `${value.length} caractère${value.length > 1 ? 's' : ''}`,
    },
    {
      field: 'createdAt',
      headerName: 'Date de création',
    },
    {
      field: 'sentAt',
      headerName: `Date d'envoi`,
    },
  ];

  return (
    <>
      {dialogData && (
        <EmailDetailsDialog open={open} onClose={() => setOpen(false)} data={dialogData} />
      )}
      <AsyncGrid columns={columns} query={['emailMessage.findAll']} />
    </>
  );
};
