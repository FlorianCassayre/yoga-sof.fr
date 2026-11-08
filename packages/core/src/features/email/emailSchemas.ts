import { z } from 'zod';

import { listSchema, sortSchema } from '../../util/list';
import { emailTypeEnum } from './type/emailTypeEnum';

export const emailListSchema = listSchema
  .extend({
    sort: sortSchema({
      userName: true,
      type: true,
      destinationAddress: true,
      subject: true,
      createdAt: true,
      sentAt: true,
    }),
  })
  .extend({
    userId: z.string().min(1).optional(),
  });

export const emailGetSchema = z.object({
  id: z.coerce.number().int(),
});

export const emailCreateSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(emailTypeEnum.enumValues),
  destinationAddress: z.email(),
  ccAddress: z.email().nullish(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export const emailAttachmentGetSchema = z.object({
  id: z.coerce.number().int(),
  attachmentId: z.coerce.number().int(),
});
