import React, { useState } from 'react';
import { AsyncGrid } from '../AsyncGrid';
import { trpc } from '../../../common/trpc';
import { userColumn } from './common';
import { Transaction, TransactionType, User } from '@prisma/client';
import { TransactionTypeNames } from '../../../common/transaction';
import { formatDateDDsmmYYYY } from '../../../common/date';
import { useSnackbar } from 'notistack';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { Delete, Edit, ShoppingCartCheckout } from '@mui/icons-material';
import { DeleteTransactionDialog } from '../../DeleteTransactionDialog';
import { GridRowParams } from '@mui/x-data-grid';
import { useRouter } from 'next/router';

interface GridActionCreateOrderProps {
  transaction: Pick<Transaction, 'id' | 'userId'>;
}

const GridActionCreateOrder: React.FC<GridActionCreateOrderProps> = ({ transaction }) => {
  const { id: transactionId, userId } = transaction;
  const router = useRouter();
  return (
    <GridActionsCellItemTooltip icon={<ShoppingCartCheckout />} href={{ pathname: '/administration/paiements/commandes/creation', query: { userId, transactionId, redirect: router.asPath } }} label="Créer une commande" />
  );
};

interface GridActionEditTransactionProps {
  transaction: Pick<Transaction, 'id'>;
}

const GridActionEditTransaction: React.FC<GridActionEditTransactionProps> = ({ transaction }) => {
  const router = useRouter();
  return (
    <GridActionsCellItemTooltip icon={<Edit />} href={{ pathname: '/administration/paiements/[id]/edition', query: { id: transaction.id, redirect: router.asPath } }} label="Modifier" />
  );
};

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
    {
      field: 'migrate',
      type: 'actions',
      sortable: false,
      minWidth: 50,
      getActions: ({ row }: GridRowParams) => [
        <GridActionCreateOrder transaction={row as any} />,
      ],
    },
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
      field: 'actions',
      type: 'actions',
      sortable: false,
      minWidth: 70,
      getActions: ({ row }: GridRowParams) => [
        <GridActionEditTransaction transaction={row as any} />,
        <GridActionDeleteTransaction transaction={row as any} />,
      ],
    },
  ];

  return (
    <AsyncGrid
      columns={columns}
      procedure={trpc.transaction.findAll}
      input={{ userId }}
      initialSort={{ field: 'date', sort: 'asc' }}
    />
  );
};
