import { adminProcedure, router } from '../trpc';
import { orderFindSchema } from '../../../common/schemas/order';
import { serializeBuffer } from '../../../common/serialize';
import { generatePdfOrderReceipt } from '../../services/pdf';
import { readTransaction } from '../../prisma';

export const pdfRouter = router({
  orderReceipt: adminProcedure
    .input(orderFindSchema)
    .query(async ({ input: { id } }) => readTransaction(async prisma => {
      const buffer = await generatePdfOrderReceipt(prisma, { where: { id } });
      return serializeBuffer(buffer);
    })),
});
