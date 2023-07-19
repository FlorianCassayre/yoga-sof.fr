import { findOrder } from './order';
import { canGenerateInvoice, OrderItemType, orderToItems } from '../../common/order';
import { displayCourseName, displayUserEmail, displayUserName } from '../../common/display';
import { createPdf } from '../pdf';
import { facturePdf } from '../../../contents/pdf/facture';
import { Prisma } from '@prisma/client';
import { ServiceError, ServiceErrorCode } from './helpers/errors';

export const generatePdfOrderReceipt = async (prisma: Prisma.TransactionClient, { where: { id } }: { where: { id: number } }) => {
  const order = await findOrder(prisma, { where: { id } });
  if (!canGenerateInvoice(order)) {
    throw new ServiceError(ServiceErrorCode.OrderInvoiceInapplicable);
  }
  const items = orderToItems(order, {
    formatItemCourseRegistration: (courseRegistration) => displayCourseName(courseRegistration.course),
    formatDiscountCourseRegistrationReplacement: (fromCourseRegistration) => 'Remplacement',
  });
  const createStars = (n: number): string => `${new Array(n + 1).fill('*').join('')}`;
  const remarks: Partial<Record<OrderItemType, { short: string, detailed: string }>> = {
    [OrderItemType.Membership]: { short: 'Période indiquée', detailed: `L'adhésion dure un an et est valable pour la période indiquée. L'adhésion est nominative.` },
    [OrderItemType.Coupon]: { short: '12 mois', detailed: `La carte est valable 12 mois à compter de la date d'émission de cette facture. La carte est nominative et ne peut pas être utilisée par d'autres personnes.` },
    [OrderItemType.CourseNormal]: { short: '3 mois', detailed: `La séance est valable pour la date et heure indiquées. Il est possible de la reporter pour une autre séance ayant lieu au maximum 3 mois après la date initiale (sous conditions). La séance reportée ne peut pas être cédée à une autre personne.` },
  };
  const typeDetails = Object.keys(remarks).map(type => parseInt(type) as OrderItemType).filter(type => items.some(i => i.type === type));
  const typeDetailsIndex = Object.fromEntries(typeDetails.map((type, i) => [type, i])) as Partial<Record<OrderItemType, number>>;
  return createPdf(facturePdf({
    id,
    date: order.date,
    paid: order.active,
    transmitter: {
      organization: 'Yoga-Sof',
      website: 'https://yoga-sof.fr',
      fullname: 'Sophie Richaud-Cassayre EI',
      address: ['8 rue des moissonneurs', '68220 Hésingue'],
      phone: '06 58 4' + '8 33 45',
      email: process.env.EMAIL_REPLY_TO,
    },
    receiver: {
      fullname: displayUserName(order.user),
      email: displayUserEmail(order.user) ?? '',
    },
    items: items.map(({ type, item, price, discount }) => ({
      title: item,
      subtitle: discount,
      price,
      remark: (() => {
        const remark = remarks[type];
        return remark !== undefined ? `${remark.short} ${createStars(typeDetailsIndex[type] ?? 0)}` : '';
      })(),
    })),
    transactionType: order.payment?.type ?? null,
    subtotal: order.computedAmount,
    total: order.payment?.amount ?? 0,
    details: typeDetails.map(type => createStars(typeDetailsIndex[type] ?? 0) + ' : ' + (remarks[type]?.detailed ?? '')),
    insurance: 'Assurance AXA',
  }));
};
