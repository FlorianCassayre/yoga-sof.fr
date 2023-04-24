import React, { useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Grid, IconButton, Stack, TextField } from '@mui/material';
import { Close, Visibility } from '@mui/icons-material';
import { GridColDef, GridRenderCellParams, GridRowParams, GridValueGetterParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { EmailMessage, EmailMessageType } from '@prisma/client';
import { relativeTimestamp, userColumn } from './common';
import { formatDateDDsMMsYYYYsHHhMMmSSs } from '../../../common/date';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { EmailMessageTypeNames } from '../../../common/emailMessages';
import { trpc } from '../../../common/trpc';
import { RouterOutput } from '../../../server/controllers/types';
import { GridValueFormatterParams } from '@mui/x-data-grid/models/params/gridCellParams';

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
              <TextField label="Destinataire" variant="outlined" value={data.destinationAddress ?? ' '} InputProps={{ readOnly: true }} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Cc" variant="outlined" value={data.ccAddress ?? ' '} InputProps={{ readOnly: true }} fullWidth />
            </Grid>
            <Grid item xs={12}>
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
};

interface EmailMessageGridProps {
  sent?: boolean;
  collapsible?: boolean;
  collapsedSummary?: React.ReactNode;
}

export const EmailMessageGrid: React.FunctionComponent<EmailMessageGridProps> = ({ sent, collapsible, collapsedSummary }) => {
  const [open, setOpen] = useState(false);
  const [dialogData, setDialogData] = useState<EmailMessage | null>(null);

  const handleDialogOpen = (row: EmailMessage) => {
    setDialogData(row);
    setOpen(true);
  };

  type EmailMessageItem = RouterOutput['emailMessage']['findAll'][0];

  const columns: GridColDef<EmailMessageItem>[] = [
    {
      field: 'details',
      type: 'actions',
      minWidth: 50,
      getActions: ({ row }: GridRowParams<EmailMessageItem>) => [
        <GridActionsCellItemTooltip icon={<Visibility />} label="Consulter" onClick={() => handleDialogOpen(row)} />,
      ],
    },
    {
      field: 'type',
      headerName: `Type d'e-mail`,
      minWidth: 250,
      flex: 1.5,
      valueGetter: ({ value }: GridValueGetterParams<EmailMessageItem, EmailMessageType>) => value !== undefined ? EmailMessageTypeNames[value] : undefined,
    },
    userColumn({ field: 'user' }),
    {
      field: 'addresses',
      headerName: 'Adresse(s) de destination',
      minWidth: 250,
      flex: 1.5,
      valueGetter: ({ row }: GridValueGetterParams<EmailMessageItem>): string[] => [row.destinationAddress, row.ccAddress].filter((a): a is string => !!a),
      renderCell: ({ value }: GridRenderCellParams<EmailMessageItem, string[]>) => !!value && (
        <Stack direction="column">
          {value.map((address, i) => (
            <Box key={i}>{address}</Box>
          ))}
        </Stack>
      ),
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
      valueGetter: ({ value }: GridValueGetterParams<EmailMessageItem, string>): number => value?.length ?? 0,
      valueFormatter: ({ value }: GridValueFormatterParams<number>) => `${value} caractère${value > 1 ? 's' : ''}`,
    },
    relativeTimestamp({ field: 'createdAt', headerName: 'Date de création', flex: 1 }),
    relativeTimestamp({ field: 'sentAt', headerName: `Date d'envoi`, flex: 1 }),
  ];

  return (
    <>
      {dialogData && (
        <EmailDetailsDialog open={open} onClose={() => setOpen(false)} data={dialogData} />
      )}
      <AsyncGrid columns={columns} procedure={trpc.emailMessage.findAll} input={{ sent }} initialSort={{ field: 'createdAt', sort: 'desc' }} collapsible={collapsible} collapsedSummary={collapsedSummary} />
    </>
  );
};
