import React, { useState } from 'react';
import { GridColDef, GridRowParams, GridValueGetterParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { trpc } from '../../../common/trpc';
import { RouterOutput } from '../../../server/controllers/types';
import { useBackofficeWritePermission } from '../../hooks/usePermission';
import { useSnackbar } from 'notistack';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { Delete, Edit } from '@mui/icons-material';
import { DeleteOtherPaymentCategoryDialog } from '../../dialogs/DeleteOtherPaymentCategoryDialog';
import { useRouter } from 'next/router';

type CategoryItem = RouterOutput['otherPaymentCategory']['findAll'][0];

interface GridActionDeleteProps {
  category: CategoryItem;
}

const GridActionDelete: React.FC<GridActionDeleteProps> = ({ category }) => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const trpcClient = trpc.useContext();
  const { mutate: mutateDelete, isLoading: isDeleting } = trpc.otherPaymentCategory.delete.useMutation({
    onSuccess: async () => {
      await Promise.all((
        [trpcClient.otherPaymentCategory.find, trpcClient.otherPaymentCategory.findAll]
      ).map(procedure => procedure.invalidate()));
      enqueueSnackbar(`La catégorie de transaction a été supprimée`, { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de la suppression de la catégorie de transaction`, { variant: 'error' });
    },
  });
  return (
    <>
      <DeleteOtherPaymentCategoryDialog category={category} open={open} setOpen={setOpen} onConfirm={() => mutateDelete({ id: category.id })} />
      {category._count.otherPayments === 0 && (
        <GridActionsCellItemTooltip icon={<Delete />} onClick={() => setOpen(true)} label="Supprimer" disabled={isDeleting} />
      )}
    </>
  );
};

export const OtherPaymentCategoryGrid: React.FunctionComponent = () => {
  const hasWritePermission = useBackofficeWritePermission();
  const router = useRouter();
  const columns: GridColDef<CategoryItem>[] = [
    {
      field: 'name',
      headerName: 'Intitulé',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'count',
      headerName: 'Transactions',
      minWidth: 150,
      flex: 1,
      valueGetter: ({ row }: GridValueGetterParams<CategoryItem>): number => row._count.otherPayments,
    },
    ...(hasWritePermission ? [{
      field: 'actions',
      type: 'actions',
      getActions: ({ row }: GridRowParams<CategoryItem>) => [
        <GridActionsCellItemTooltip icon={<Edit />} onClick={() => router.push({ pathname: '/administration/transactions/categories/[id]/edition', query: { id: row.id } })} label="Modifier" />,
        <GridActionDelete category={row} />,
      ],
    } satisfies GridColDef<CategoryItem>] : []),
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.otherPaymentCategory.findAll} input={undefined} initialSort={{ field: 'name', sort: 'asc' }} />
  );
};
