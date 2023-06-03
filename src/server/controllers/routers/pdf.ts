import { adminProcedure, router } from '../trpc';
import { orderFindSchema } from '../../../common/schemas/order';
import { serializeBuffer } from '../../../common/serialize';
import { facturePdf } from '../../../../contents/pdf/facture';
import { createPdf } from '../../pdf';
import { displayCourseName, displayUserEmail, displayUserName } from '../../../common/display';
import { findOrder } from '../../services/order';
import { orderToItems } from '../../../common/order';

export const pdfRouter = router({
  orderReceipt: adminProcedure
    .input(orderFindSchema)
    .query(async ({ input: { id } }) => {
      const order = await findOrder({ where: { id } });
      const items = orderToItems(order, {
        formatItemCourseRegistration: (courseRegistration) => displayCourseName(courseRegistration.course),
        formatDiscountCourseRegistrationReplacement: (fromCourseRegistration) => 'Remplacement',
      });
      const buffer = await createPdf(facturePdf({
        id,
        date: order.date,
        paid: order.active,
        transmitter: {
          organization: 'Yoga Sof',
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
        items: items.map(({ item, oldPrice, price, discount }) => ({
          title: item,
          subtitle: discount,
          price,
          remark: '',
        })),
        transactionType: order.payment?.type ?? null,
        subtotal: order.computedAmount,
        total: order.payment?.amount ?? 0,
        insurance: 'Assurance AXA',
      }));
      return serializeBuffer(buffer);
    }),
});
