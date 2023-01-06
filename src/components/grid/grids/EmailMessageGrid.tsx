import React, { useState } from 'react';
import { GridColumns } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Dialog, DialogContent, DialogTitle, Grid, IconButton, TextField, Typography } from '@mui/material';
import { Close, Visibility } from '@mui/icons-material';
import { GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { EmailMessage, EmailMessageType } from '@prisma/client';
import { relativeTimestamp, userColumn } from './common';
import { formatDateDDsMMsYYYYsHHhMMmSSs } from '../../../common/date';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { EmailMessageTypeNames } from '../../../common/emailMessages';
import { trpc } from '../../../common/trpc';

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
              <TextField label="Destinataire" variant="outlined" value={data.destinationAddress} InputProps={{ readOnly: true }} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Date d'envoi" variant="outlined" value={data.sentAt ? formatDateDDsMMsYYYYsHHhMMmSSs(data.sentAt) : ''} InputProps={{ readOnly: true }} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Objet" variant="outlined" value={data.subject} InputProps={{ readOnly: true }} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Message" variant="outlined" value={data.message} InputProps={{ readOnly: true }} fullWidth multiline />
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
        <GridActionsCellItemTooltip icon={<Visibility />} label="Consulter" onClick={() => handleDialogOpen(row)} />,
      ],
    },
    {
      field: 'type',
      headerName: `Type d'e-mail`,
      minWidth: 250,
      flex: 1.5,
      valueGetter: ({ value }: { value: EmailMessageType }) => EmailMessageTypeNames[value],
    },
    userColumn({ field: 'user' }),
    {
      field: 'destinationAddress',
      headerName: 'Addresse de destination',
      minWidth: 250,
      flex: 1.5,
    },
    {
      field: 'subject',
      headerName: 'Sujet',
      minWidth: 300,
      flex: 2,
    },
    {
      field: 'message',
      headerName: 'Longueur',
      minWidth: 150,
      flex: 1,
      valueGetter: ({ value }) => value.length,
      valueFormatter: ({ value }) => `${value} caractère${value > 1 ? 's' : ''}`,
    },
    relativeTimestamp({ field: 'createdAt', headerName: 'Date de création', flex: 1 }),
    relativeTimestamp({ field: 'sentAt', headerName: `Date d'envoi`, flex: 1 }),
  ];

  return (
    <>
      {dialogData && (
        <EmailDetailsDialog open={open} onClose={() => setOpen(false)} data={dialogData} />
      )}
      <AsyncGrid columns={columns} procedure={trpc.emailMessage.findAll} input={undefined} initialSort={{ field: 'createdAt', sort: 'desc' }} />
    </>
  );
};
