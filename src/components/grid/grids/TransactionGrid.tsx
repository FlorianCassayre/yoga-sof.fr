import React, { useState } from 'react';
import { AsyncGrid } from '../AsyncGrid';
import { trpc } from '../../../common/trpc';
import { userColumn } from './common';
import { Transaction, TransactionType, User } from '@prisma/client';
import { TransactionTypeNames } from '../../../common/transaction';
import { formatDateDDsmmYYYY } from '../../../common/date';
import { useSnackbar } from 'notistack';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { Delete } from '@mui/icons-material';
import { DeleteTransactionDialog } from '../../DeleteTransactionDialog';
import { GridRowParams } from '@mui/x-data-grid';

interface GridActionDeleteTransactionProps {
  transaction: Transaction & { user: User };
}

const GridActionDeleteTransaction: React.FC<GridActionDeleteTransactionProps> = ({ transaction }) => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const trpcClient = trpc.useContext();
  const { mutate: mutateDelete, isLoading: isDeleting } = trpc.transaction.delete.useMutation({
    onSuccess: async () => {
      await Promise.all((
        [trpcClient.transaction.find, trpcClient.transaction.findAll, trpcClient.user.find, trpcClient.user.findAll]
      ).map(procedure => procedure.invalidate()));
      enqueueSnackbar(`Le paiement a été supprimé`, { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de la suppression du paiement`, { variant: 'error' });
    },
  });
  return (
    <>
      <DeleteTransactionDialog transaction={transaction} open={open} setOpen={setOpen} onConfirm={() => mutateDelete({ id: transaction.id })} />
      <GridActionsCellItemTooltip icon={<Delete />} onClick={() => setOpen(true)} label="Supprimer" disabled={isDeleting} />
    </>
  );
};

interface TransactionGridProps {
  userId?: number;
}

export const TransactionGrid: React.FunctionComponent<TransactionGridProps> = ({ userId }) => {
  const columns = [
    ...(userId === undefined ? [userColumn({
      field: 'user',
      flex: 1,
    })] : []),
    {
      field: 'amount',
      headerName: 'Montant',
      valueFormatter: ({ value }: { value: number }) => `${value} €`,
      minWidth: 100,
      flex: 1,
    },
    {
      field: 'type',
      headerName: 'Moyen de paiement',
      valueFormatter: ({ value }: { value: TransactionType }) => TransactionTypeNames[value],
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'date',
      headerName: 'Date du paiement',
      valueFormatter: ({ value }: { value: Date }) => formatDateDDsmmYYYY(value),
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'comment',
      headerName: 'Commentaires',
      minWidth: 500,
      flex: 1,
    },
    {
      field: 'delete',
      type: 'actions',
      sortable: false,
      minWidth: 50,
      getActions: ({ row }: GridRowParams) => [
        <GridActionDeleteTransaction transaction={row as any} />,
      ],
    },
  ];

  return (
    <AsyncGrid
      columns={columns}
      procedure={trpc.transaction.findAll}
      input={{ userId }}
      initialSort={{ field: 'date', sort: 'desc' }}
    />
  );
};
