'use client';

import { IconButton } from '@mui/material';
import { formatPrice, MEMBERSHIP_TYPE_LABELS } from '@yoga-sof/core';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '../../../components/dialog/ConfirmDialog';
import { DataGrid } from '../../../components/grid/DataGrid';
import type { GridColumns } from '../../../components/grid/GridColumns';
import { Link } from '../../../components/link/Link';
import { api } from '../../../server/api';
import type { RouterOutputs } from '../../../server/appRouter';

type MembershipPriceRow = RouterOutputs['membershipPrice']['list']['rows'][number];

export const MembershipPriceGrid = () => {
  const [deleting, setDeleting] = useState<MembershipPriceRow | null>(null);

  const columns: GridColumns<MembershipPriceRow> = [
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
        <IconButton key="delete" size="small" onClick={() => setDeleting(params.row)}>
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
        <ConfirmDialog
          procedure={api.membershipPrice.delete}
          input={{ id: deleting.id, version: deleting.version }}
          title="Supprimer le tarif"
          message={`Voulez-vous vraiment supprimer le tarif ${MEMBERSHIP_TYPE_LABELS[deleting.type]} (${formatPrice(deleting.price)}) ?`}
          confirmLabel="Supprimer"
          successMessage="Tarif supprimé."
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
};
