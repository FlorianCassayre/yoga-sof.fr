import { findEmailMessageAttachments, findEmailMessages } from '../../services';
import { backofficeReadProcedure, backofficeWriteProcedure, router } from '../trpc';
import { z } from 'zod';
import { serializeBuffer } from '../../../common/serialize';

export const emailMessageRouter = router({
  findAll: backofficeReadProcedure
    .input(z.strictObject({
      sent: z.boolean().optional(),
    }))
    .query(async ({ input: { sent } }) => findEmailMessages({ where: { sent } })),
  findAttachment: backofficeReadProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .query(async ({ input: { id } }) => {
      const { filename, file } = await findEmailMessageAttachments({ where: { id } });
      return { filename, file: serializeBuffer(file) };
    })
});
