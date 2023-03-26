import React from 'react';
import { BackofficeContent } from '../../../../components/layout/admin/BackofficeContent';
import { ArrowRightAlt, InfoOutlined, QuestionMark, ShoppingCart } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useSchemaQuery } from '../../../../components/hooks/useSchemaQuery';
import { trpc } from '../../../../common/trpc';
import { BackofficeContentLoading } from '../../../../components/layout/admin/BackofficeContentLoading';
import { BackofficeContentError } from '../../../../components/layout/admin/BackofficeContentError';
import { orderFindTransformSchema } from '../../../../common/schemas/order';
import { RouterOutput } from '../../../../server/controllers/types';
import { Box, Card, Chip, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { CourseLink } from '../../../../components/link/CourseLink';
import { Prisma } from '@prisma/client';
import { displayCouponName, displayMembershipName, displayUserName } from '../../../../common/display';
import { TransactionTypeNames } from '../../../../common/transaction';
import { InformationTableCard } from '../../../../components/InformationTableCard';
import { formatDateDDsMMsYYYYsHHhMMmSSs, formatDateDDsmmYYYY } from '../../../../common/date';
import { UserLink } from '../../../../components/link/UserLink';

interface OrderViewContentProps {
  order: RouterOutput['order']['find'];
}

const OrderViewContent: React.FC<OrderViewContentProps> = ({ order }) => {
  type PurchaseTableItem = { item: React.ReactNode, oldPrice?: number, price: number, discount?: React.ReactNode };
  const makeCourseRegistrationsTableData =
    (items: (Omit<PurchaseTableItem, 'item'> & { courseRegistration: Prisma.CourseRegistrationGetPayload<{ include: { course: true } }> })[]): PurchaseTableItem[] =>
      items
        .sort(({ courseRegistration: { course: { dateStart: a } } }, { courseRegistration: { course: { dateStart: b } } }) => a.getTime() - b.getTime())
        .map(({ courseRegistration, ...item }) => ({
          item: <CourseLink course={courseRegistration.course} />,
          ...item,
        }));
  const purchasesTableData: PurchaseTableItem[] =
    [
      ...order.purchasedMemberships
        .sort(({ dateStart: a }, { dateStart: b }) => a.getTime() - b.getTime())
        .map(m => ({
          item: displayMembershipName(m),
          price: m.price,
        })),
      ...order.purchasedCoupons
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

  const displayPrice = (price: number) => `${price} €`;

  return (
    <BackofficeContent
      title={`Commande du ${formatDateDDsmmYYYY(order.date)} pour ${displayUserName(order.user)}`}
      icon={<ShoppingCart />}
    >
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} lg={3} xl={3}>
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
                value: <Chip label="Migré" color="default" variant="outlined" icon={<InfoOutlined />} size="small" />,
              }] : []),
            ]}
          />
        </Grid>
        <Grid item xs={12} lg={9} xl={6}>
          <Card variant="outlined" sx={{ borderBottom: 'none' }}>
            <Table /*size="small"*/>
              <TableHead>
                <TableRow>
                  <TableCell variant="head">Article</TableCell>
                  <TableCell variant="head" align="right">Prix</TableCell>
                  <TableCell variant="head">Réduction</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchasesTableData.map(({ item, oldPrice, price, discount }, i) => (
                  <TableRow key={i}>
                    <TableCell>{item}</TableCell>
                    <TableCell align="right">
                      {oldPrice !== undefined ?
                        (
                          <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                            <Box sx={{ textDecoration: 'line-through' }}>{displayPrice(oldPrice)}</Box>
                            <ArrowRightAlt color="action" />
                            <Box>{displayPrice(price)}</Box>
                          </Stack>
                        ) :
                        displayPrice(price)}
                    </TableCell>
                    <TableCell>{discount}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell variant="head" align="right">Total à payer</TableCell>
                  <TableCell align="right">{displayPrice(order.computedAmount)}</TableCell>
                  <TableCell>{null}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell variant="head" align="right">Total payé</TableCell>
                  <TableCell align="right">{displayPrice(order?.payment?.amount ?? 0)}</TableCell>
                  <TableCell>{order?.payment ? TransactionTypeNames[order.payment.type] : null}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </Grid>
      </Grid>
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
