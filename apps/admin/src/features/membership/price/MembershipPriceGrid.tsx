'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useQueryClient } from '@tanstack/react-query';
import { formatPrice, MEMBERSHIP_TYPE_LABELS } from '@yoga-sof/core';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { DataGrid } from '../../../components/grid/DataGrid';
import { api } from '../../../server/api';
import type { RouterOutputs } from '../../../server/appRouter';

type MembershipPriceRow = RouterOutputs['membershipPrice']['list']['rows'][number];

export const MembershipPriceGrid = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const deleteMutation = api.membershipPrice.delete.useMutation();
  const [deleting, setDeleting] = useState<MembershipPriceRow | null>(null);

  const closeDialog = () => setDeleting(null);

  const deletePrice = () => {
    if (!deleting) {
      return;
    }
    deleteMutation
      .mutateAsync({ id: deleting.id, version: deleting.version })
      .then(async () => {
        enqueueSnackbar('Tarif supprimé.', { variant: 'success' });
        await queryClient.invalidateQueries();
      })
      .catch((error: unknown) => {
        enqueueSnackbar(error instanceof Error ? error.message : 'Une erreur est survenue.', {
          variant: 'error',
        });
      })
      .finally(closeDialog);
  };

  const columns: GridColDef<MembershipPriceRow>[] = [
    {
      field: 'type',
      headerName: "Type d'adhésion",
      flex: 1,
      valueFormatter: (value) => MEMBERSHIP_TYPE_LABELS[value],
    },
    {
      field: 'price',
      headerName: "Prix d'achat",
      type: 'number',
      flex: 1,
      valueFormatter: (value) => formatPrice(value),
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      renderCell: (params) => [
        <IconButton
          key="edit"
          component={Link}
          href={`/parametres/tarifs/${params.row.id}/edition`}
          size="small"
        >
          <Pencil size={18} />
        </IconButton>,
        <IconButton
          key="delete"
          size="small"
          disabled={deleteMutation.isPending}
          onClick={() => setDeleting(params.row)}
        >
          <Trash2 size={18} />
        </IconButton>,
      ],
    },
  ];

  return (
    <>
      <DataGrid
        columns={columns}
        defaultSort={{ field: 'type', sort: 'asc' }}
        procedure={api.membershipPrice.list}
      />
      {deleting && (
        <Dialog open onClose={closeDialog}>
          <DialogTitle>Supprimer le tarif</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Voulez-vous vraiment supprimer le tarif {MEMBERSHIP_TYPE_LABELS[deleting.type]} (
              {formatPrice(deleting.price)}) ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog} disabled={deleteMutation.isPending}>
              Annuler
            </Button>
            <Button onClick={deletePrice} color="error" disabled={deleteMutation.isPending}>
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
