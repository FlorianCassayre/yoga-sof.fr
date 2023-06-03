import { prisma } from '../prisma';

export const findEmailMessages = async ({ where: { sent } }: { where: { sent?: boolean } }) =>
  prisma.emailMessage.findMany({
    where: sent === undefined ? undefined : sent ? { NOT: { sentAt: null } } : { sentAt: null },
    include: {
      user: true,
      attachments: {
        select: {
          id: true,
          filename: true,
        },
      },
    },
  });

export const findEmailMessageAttachments = ({ where: { id } }: { where: { id: number } }) =>
  prisma.emailMessageAttachment.findUniqueOrThrow({ where: { id } });
