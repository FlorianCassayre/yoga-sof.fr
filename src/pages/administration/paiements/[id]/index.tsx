import React, { useState } from 'react';
import { BackofficeContent } from '../../../../components/layout/admin/BackofficeContent';
import { Delete, Edit, InfoOutlined, PictureAsPdf, ShoppingCart } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useSchemaQuery } from '../../../../components/hooks/useSchemaQuery';
import { trpc } from '../../../../common/trpc';
import { BackofficeContentLoading } from '../../../../components/layout/admin/BackofficeContentLoading';
import { BackofficeContentError } from '../../../../components/layout/admin/BackofficeContentError';
import { orderFindTransformSchema } from '../../../../common/schemas/order';
import { RouterOutput } from '../../../../server/controllers/types';
import { Box, Card, Chip, Grid, Stack } from '@mui/material';
import { CourseLink } from '../../../../components/link/CourseLink';
import { displayUserName } from '../../../../common/display';
import { InformationTableCard } from '../../../../components/InformationTableCard';
import { formatDateDDsMMsYYYYsHHhMMmSSs, formatDateDDsmmYYYY } from '../../../../common/date';
import { UserLink } from '../../../../components/link/UserLink';
import { DeleteOrderDialog } from '../../../../components/dialogs/DeleteOrderDialog';
import { useSnackbar } from 'notistack';
import { PurchasesTable } from '../../../../components/PurchasesTable';
import { canGenerateInvoice, orderToItems } from '../../../../common/order';
import { PaymentRecipientNames } from '../../../../common/payment';

interface OrderViewContentProps {
  order: RouterOutput['order']['find'];
}

const OrderViewContent: React.FC<OrderViewContentProps> = ({ order }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const trpcClient = trpc.useContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { mutate: mutateDelete, isLoading: isDeleteLoading } = trpc.order.delete.useMutation({
    onSuccess: async () => {
      await Promise.all(([trpcClient.order.find, trpcClient.order.findAll]).map(procedure => procedure.invalidate()));
      enqueueSnackbar(`Le paiement a été supprimé`, { variant: 'success' });
      return router.push('/administration/paiements');
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de la suppression du paiement`, { variant: 'error' });
    },
  });

  const purchasesTableData = orderToItems(order, {
    formatItemCourseRegistration: (courseRegistration) => (
      <CourseLink course={courseRegistration.course} />
    ),
    formatDiscountCourseRegistrationReplacement: (fromCourseRegistration) => (
      <Stack direction="row" alignItems="center" gap={1}>
        <Box>Remplacement :</Box>
        <CourseLink course={fromCourseRegistration.course} />
      </Stack>
    ),
  });

  return (
    <BackofficeContent
      title={`Paiement du ${formatDateDDsmmYYYY(order.date)} pour ${displayUserName(order.user)}`}
      icon={<ShoppingCart />}
      actions={[
        ...(canGenerateInvoice(order) ? [{ name: 'Imprimer', icon: <PictureAsPdf />, url: { pathname: '/administration/pdf/factures/[id]', query: { id: order.id } } }] : []),
        { name: 'Modifier', icon: <Edit />, url: { pathname: '/administration/paiements/[id]/edition', query: { id: order.id, redirect: router.asPath } } },
        { name: 'Supprimer', icon: <Delete />, onClick: () => setDeleteDialogOpen(true), disabled: isDeleteLoading },
      ]}
    >
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} lg={3} xl={4}>
          <InformationTableCard
            rows={[
              {
                header: 'Utilisateur',
                value: <UserLink user={order.user} />,
              },
              ...(order.payment ? [{
                header: 'Bénéficiaire',
                value: PaymentRecipientNames[order.payment.recipient],
              }] : []),
              {
                header: 'Date',
                value: formatDateDDsmmYYYY(order.date),
              },
              {
                header: 'Création',
                value: formatDateDDsMMsYYYYsHHhMMmSSs(order.createdAt),
              },
              {
                header: 'Notes',
                value: order.notes,
              },
              ...(order.transaction ? [{
                header: 'Autre',
                value: <Chip label={`Migré : ${order.transaction.comment}`} color="default" variant="outlined" icon={<InfoOutlined />} size="small" />,
              }] : []),
            ]}
          />
        </Grid>
        <Grid item xs={12} lg={9} xl={8}>
          <Card variant="outlined" sx={{ borderBottom: 'none' }}>
            <PurchasesTable
              rows={purchasesTableData}
              totalToPay={order.computedAmount}
              paid={{
                amount: order.payment?.amount ?? 0,
                type: order.payment?.type,
              }}
            />
          </Card>
        </Grid>
      </Grid>
      <DeleteOrderDialog order={order} open={deleteDialogOpen} setOpen={setDeleteDialogOpen} onConfirm={() => mutateDelete({ id: order.id })} />
    </BackofficeContent>
  );
};

export default function OrderView() {
  const router = useRouter();
  const { id } = router.query;
  const result = useSchemaQuery(trpc.order.find, { id }, orderFindTransformSchema);

  return result && result.data && result.data.active ? (
    <OrderViewContent order={result.data} />
  ) : result?.isLoading ? <BackofficeContentLoading /> : <BackofficeContentError error={result?.error} />;
}
