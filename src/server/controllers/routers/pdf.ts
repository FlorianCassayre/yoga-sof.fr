import { backofficeReadProcedure, backofficeWriteProcedure, router } from '../trpc';
import { orderFindSchema } from '../../../common/schemas/order';
import { serializeBuffer } from '../../../common/serialize';
import { generatePdfFreeInvoice, generatePdfOrderInvoice } from '../../services/pdf';
import { readTransaction } from '../../prisma';
import { freeInvoiceSchema } from '../../../common/schemas/invoice';

export const pdfRouter = router({
  orderInvoice: backofficeReadProcedure
    .input(orderFindSchema)
    .query(async ({ input: { id } }) => readTransaction(async prisma => {
      const buffer = await generatePdfOrderInvoice(prisma, { where: { id } });
      return serializeBuffer(buffer);
    })),
  freeInvoice: backofficeWriteProcedure // Not a typo: even if side effect free, this is a restricted operation
    .input(freeInvoiceSchema)
    .mutation(async ({ input: data }) => {
      const buffer = await generatePdfFreeInvoice(({
        ...data,
        items: data.items.map((item) => ({
          ...item,
          subtitle: item.subtitle ? item.subtitle : undefined,
          remark: item.remark ? item.remark : ''
        })),
        transactionType: data.transactionType ?? null,
      }));
      return serializeBuffer(buffer);
    }),
});
