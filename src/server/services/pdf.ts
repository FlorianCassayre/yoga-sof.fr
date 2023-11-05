import { findOrder } from './order';
import { canGenerateInvoice, OrderItemType, orderToItems } from '../../common/order';
import { displayCourseName, displayUserEmail, displayUserName } from '../../common/display';
import { createPdf } from '../pdf';
import { facturePdf, FactureProps } from '../../../contents/pdf/facture';
import { Prisma } from '@prisma/client';
import { ServiceError, ServiceErrorCode } from './helpers/errors';
import {
  INVOICE_INSURANCE,
  INVOICE_ORDER_REMARKS, INVOICE_PAYMENT_CONDITIONS,
  INVOICE_TRANSMITTER
} from '../../../contents/pdf/factureData';

const receiverForUser = (user: Parameters<typeof displayUserName>[0] & Parameters<typeof displayUserEmail>[0]): FactureProps['receiver'] => ({
  fullname: displayUserName(user),
  email: displayUserEmail(user) ?? '',
});

const createStars = (n: number): string => `${new Array(n + 1).fill('*').join('')}`;

export const generatePdfOrderInvoice = async (prisma: Prisma.TransactionClient, { where: { id } }: { where: { id: number } }) => {
  const order = await findOrder(prisma, { where: { id } });
  if (!canGenerateInvoice(order)) {
    throw new ServiceError(ServiceErrorCode.OrderInvoiceInapplicable);
  }
  const items = orderToItems(order, {
    formatItemCourseRegistration: (courseRegistration) => displayCourseName(courseRegistration.course),
    formatDiscountCourseRegistrationReplacement: (fromCourseRegistration) => 'Remplacement',
  });
  const typeDetails = Object.keys(INVOICE_ORDER_REMARKS).map(type => parseInt(type) as OrderItemType).filter(type => items.some(i => i.type === type));
  const typeDetailsIndex = Object.fromEntries(typeDetails.map((type, i) => [type, i])) as Partial<Record<OrderItemType, number>>;
  return createPdf(facturePdf({
    id,
    customId: false,
    date: order.date,
    paid: order.active,
    transmitter: INVOICE_TRANSMITTER,
    receiver: receiverForUser(order.user),
    items: items.map(({ type, item, price, discount }) => ({
      title: item,
      subtitle: discount,
      price,
      remark: (() => {
        const remark = INVOICE_ORDER_REMARKS[type];
        return remark !== undefined ? `${remark.short} ${createStars(typeDetailsIndex[type] ?? 0)}` : '';
      })(),
    })),
    transactionType: order.payment?.type ?? null,
    subtotal: order.computedAmount,
    total: order.payment?.amount ?? 0,
    details: typeDetails.map(type => createStars(typeDetailsIndex[type] ?? 0) + ' : ' + (INVOICE_ORDER_REMARKS[type]?.detailed ?? '')),
    insurance: INVOICE_INSURANCE,
  }));
};

export const generatePdfFreeInvoice = (data: Omit<FactureProps, 'customId' | 'transmitter' | 'insurance' | 'details' | 'subtotal' | 'total' | 'siret'> & { discount: number }) => {
  const subtotal = data.items.map(({ price }) => price).reduce((p, c) => p + c, 0);
  const total = subtotal - data.discount;
  const uniqueRemarks = new Set<string>();
  const remarks: string[] = [];
  const remarkByIndex: (number | null)[] = [];
  data.items.forEach(item => {
    const trimmedRemark = item.remark.trim();
    let remarkIndex: number | null = null;
    if (trimmedRemark) {
      if (!uniqueRemarks.has(trimmedRemark)) {
        remarkIndex = remarks.length;
        remarks.push(trimmedRemark);
        uniqueRemarks.add(trimmedRemark);
      }
    }
    remarkByIndex.push(remarkIndex);
  });
  const actualItems = data.items
    .map((item, i) => ({ ...item, remark: remarkByIndex[i] !== null ? createStars(remarkByIndex[i] ?? 0) : '' }));
  return createPdf(facturePdf({
    ...data,
    customId: true,
    transmitter: INVOICE_TRANSMITTER,
    items: actualItems, // Replace it
    subtotal,
    total,
    conditions: INVOICE_PAYMENT_CONDITIONS,
    details: remarks.map((remark, i) => createStars(i) + ' : ' + remark),
    insurance: INVOICE_INSURANCE,
  }));
};
