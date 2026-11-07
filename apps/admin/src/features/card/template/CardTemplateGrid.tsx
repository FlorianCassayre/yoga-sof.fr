'use client';

import { IconButton } from '@mui/material';
import { COURSE_TYPE_LABELS, formatPrice } from '@yoga-sof/core';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '../../../components/dialog/ConfirmDialog';
import { DataGrid } from '../../../components/grid/DataGrid';
import type { GridColumns } from '../../../components/grid/GridColumns';
import { Link } from '../../../components/link/Link';
import { api } from '../../../server/api';
import type { RouterOutputs } from '../../../server/appRouter';

type CardTemplateRow = RouterOutputs['cardTemplate']['list']['rows'][number];

export const CardTemplateGrid = () => {
  const [deleting, setDeleting] = useState<CardTemplateRow | null>(null);

  const columns: GridColumns<CardTemplateRow> = [
    {
      field: 'type',
      headerName: 'Type de séance',
      flex: 1,
      valueFormatter: (value) => COURSE_TYPE_LABELS[value],
    },
    {
      field: 'count',
      headerName: 'Séances',
      type: 'number',
      flex: 1,
    },
    {
      field: 'price',
      headerName: 'Prix',
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
          href={`/parametres/modeles/${params.row.id}/edition`}
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
        defaultSort={{ field: 'count', sort: 'asc' }}
        procedure={api.cardTemplate.list}
      />
      {deleting && (
        <ConfirmDialog
          procedure={api.cardTemplate.delete}
          input={{ id: deleting.id, version: deleting.version }}
          title="Supprimer le modèle"
          message={`Voulez-vous vraiment supprimer le modèle ${COURSE_TYPE_LABELS[deleting.type]} (${deleting.count} séances, ${formatPrice(deleting.price)}) ?`}
          confirmLabel="Supprimer"
          successMessage="Modèle supprimé."
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
};
