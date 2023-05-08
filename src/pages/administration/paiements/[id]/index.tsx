import React, { useState } from 'react';
import { BackofficeContent } from '../../../../components/layout/admin/BackofficeContent';
import { Delete, Edit, InfoOutlined, ShoppingCart } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useSchemaQuery } from '../../../../components/hooks/useSchemaQuery';
import { trpc } from '../../../../common/trpc';
import { BackofficeContentLoading } from '../../../../components/layout/admin/BackofficeContentLoading';
import { BackofficeContentError } from '../../../../components/layout/admin/BackofficeContentError';
import { orderFindTransformSchema } from '../../../../common/schemas/order';
import { RouterOutput } from '../../../../server/controllers/types';
import { Box, Card, Chip, Grid, Stack } from '@mui/material';
import { CourseLink } from '../../../../components/link/CourseLink';
import { Prisma } from '@prisma/client';
import { displayCouponName, displayMembershipName, displayUserName } from '../../../../common/display';
import { InformationTableCard } from '../../../../components/InformationTableCard';
import { formatDateDDsMMsYYYYsHHhMMmSSs, formatDateDDsmmYYYY } from '../../../../common/date';
import { UserLink } from '../../../../components/link/UserLink';
import { DeleteOrderDialog } from '../../../../components/DeleteOrderDialog';
import { useSnackbar } from 'notistack';
import { PurchasesTable } from '../../../../components/PurchasesTable';

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

  type PurchaseTableItem = Parameters<typeof PurchasesTable>[0]['rows'][0];
  const makeCourseRegistrationsTableData =
    (items: (Omit<PurchaseTableItem, 'item'> & { courseRegistration: Prisma.CourseRegistrationGetPayload<{ include: { course: true } }> })[]): PurchaseTableItem[] =>
      [...items]
        .sort(({ courseRegistration: { course: { dateStart: a } } }, { courseRegistration: { course: { dateStart: b } } }) => a.getTime() - b.getTime())
        .map(({ courseRegistration, ...item }) => ({
          item: <CourseLink course={courseRegistration.course} />,
          ...item,
        }));
  const purchasesTableData: PurchaseTableItem[] =
    [
      ...[...order.purchasedMemberships]
        .sort(({ dateStart: a }, { dateStart: b }) => a.getTime() - b.getTime())
        .map(m => ({
          item: displayMembershipName(m),
          price: m.price,
        })),
      ...[...order.purchasedCoupons]
        .sort(({ createdAt: a }, { createdAt: b }) => a.getTime() - b.getTime())
        .map(c => ({
          item: displayCouponName(c),
          price: c.price,
        })),
      ...makeCourseRegistrationsTableData([
        ...order.purchasedCourseRegistrations.map(r => ({
          courseRegistration: r,
          price: r.course.price,
        })),
        ...order.usedCouponCourseRegistrations.map(({ courseRegistration, coupon }) => ({
          courseRegistration,
          oldPrice: courseRegistration.course.price,
          price: 0,
          discount: displayCouponName(coupon),
        })),
        ...order.trialCourseRegistrations.map(({ courseRegistration, price }) => ({
          courseRegistration,
          oldPrice: courseRegistration.course.price,
          price: price,
          discount: `Séance d'essai`,
        })),
        ...order.replacementCourseRegistrations.map(({ fromCourseRegistration, toCourseRegistration }) => ({
          courseRegistration: toCourseRegistration,
          oldPrice: toCourseRegistration.course.price,
          price: 0,
          discount: (
            <Stack direction="row" alignItems="center" gap={1}>
              <Box>Remplacement :</Box>
              <CourseLink course={fromCourseRegistration.course} />
            </Stack>
          ),
        }))
      ]),
    ];

  return (
    <BackofficeContent
      title={`Paiement du ${formatDateDDsmmYYYY(order.date)} pour ${displayUserName(order.user)}`}
      icon={<ShoppingCart />}
      actions={[
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
