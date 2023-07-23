import React, { useState } from 'react';
import { GridColDef, GridRenderCellParams, GridRowParams, GridValueGetterParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { trpc } from '../../../common/trpc';
import { RouterOutput } from '../../../server/controllers/types';
import { useBackofficeWritePermission } from '../../hooks/usePermission';
import { useSnackbar } from 'notistack';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { Add, Delete, Edit, Remove } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { GridValueFormatterParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { PaymentRecipient } from '@prisma/client';
import { PaymentRecipientNames } from '../../../common/payment';
import { formatDateDDsmmYYYY } from '../../../common/date';
import { DeleteOtherPaymentDialog } from '../../dialogs/DeleteOtherPaymentDialog';
import { Box, Stack } from '@mui/material';

type OtherPaymentItem = RouterOutput['otherPayment']['findAll'][0];

interface GridActionDeleteProps {
  otherPayment: OtherPaymentItem;
}

const GridActionDelete: React.FC<GridActionDeleteProps> = ({ otherPayment }) => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const trpcClient = trpc.useContext();
  const { mutate: mutateDelete, isLoading: isDeleting } = trpc.otherPayment.delete.useMutation({
    onSuccess: async () => {
      await Promise.all((
        [trpcClient.otherPayment.find, trpcClient.otherPayment.findUpdate, trpcClient.otherPayment.findAll]
      ).map(procedure => procedure.invalidate()));
      enqueueSnackbar(`La transaction a été supprimée`, { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de la suppression de la transaction`, { variant: 'error' });
    },
  });
  return (
    <>
      <DeleteOtherPaymentDialog otherPayment={otherPayment} open={open} setOpen={setOpen} onConfirm={() => mutateDelete({ id: otherPayment.id })} />
      <GridActionsCellItemTooltip icon={<Delete />} onClick={() => setOpen(true)} label="Supprimer" disabled={isDeleting} />
    </>
  );
};

export const OtherPaymentGrid: React.FunctionComponent = () => {
  const hasWritePermission = useBackofficeWritePermission();
  const router = useRouter();
  const columns: GridColDef<OtherPaymentItem>[] = [
    {
      field: 'description',
      headerName: 'Motif',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'category',
      headerName: 'Catégorie',
      minWidth: 200,
      flex: 1,
      valueGetter: ({ row: { category } }: GridValueGetterParams<OtherPaymentItem>): string => category.name,
    },
    {
      field: 'amount',
      headerName: 'Montant',
      minWidth: 100,
      flex: 1,
      valueGetter: ({ row: { amountCents } }: GridValueGetterParams<OtherPaymentItem>): number => amountCents / 100,
      renderCell: ({ value }: GridRenderCellParams<OtherPaymentItem, number>) => {
        if (value === undefined) return;
        const valueAbs = Math.abs(value);
        const formatted = `${Math.round(valueAbs) === valueAbs ? valueAbs : valueAbs.toFixed(2).replace('.', ',')} €`;
        const isPositive = value >= 0;
        const iconColor = isPositive ? 'success' : 'error';
        const textColor = isPositive ? 'success.main' : 'error.main';
        return (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {isPositive ? <Add color={iconColor} /> : <Remove color={iconColor} />}
            <Box sx={{ color: textColor }}>
              {formatted}
            </Box>
          </Stack>
        )
      }
    },
    {
      field: 'provider',
      headerName: 'Client',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'recipient',
      headerName: 'Entité',
      minWidth: 120,
      flex: 1,
      valueFormatter: ({ value }: GridValueFormatterParams<PaymentRecipient>) => PaymentRecipientNames[value],
    },
    {
      field: 'date',
      headerName: 'Date du paiement',
      valueFormatter: ({ value }: GridValueFormatterParams<Date>) => formatDateDDsmmYYYY(value),
      minWidth: 200,
      flex: 1,
    },
    ...(hasWritePermission ? [{
      field: 'actions',
      type: 'actions',
      getActions: ({ row }: GridRowParams<OtherPaymentItem>) => [
        <GridActionsCellItemTooltip icon={<Edit />} onClick={() => router.push({ pathname: '/administration/transactions/[id]/edition', query: { id: row.id } })} label="Modifier" />,
        <GridActionDelete otherPayment={row} />,
      ],
    } satisfies GridColDef<OtherPaymentItem>] : []),
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.otherPayment.findAll} input={undefined} initialSort={{ field: 'createdAt', sort: 'desc' }} />
  );
};
