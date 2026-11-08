import {
  emailAttachmentGetSchema,
  emailService,
  roleService,
  ServiceError,
  withTransaction,
} from '@yoga-sof/core/server';
import { auth } from '@yoga-sof/ui/auth';

const download = async (
  _request: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> },
) => {
  const userId = (await auth())?.user?.id;
  if (!userId) {
    return new Response(null, { status: 401 });
  }
  const allowed = await withTransaction((tx) => roleService.hasPermission(userId, 'readData', tx), {
    readOnly: true,
  });
  if (!allowed) {
    return new Response(null, { status: 403 });
  }

  const parsed = emailAttachmentGetSchema.safeParse(await params);
  if (!parsed.success) {
    return new Response(null, { status: 400 });
  }

  try {
    const { filename, file } = await withTransaction(
      (tx) => emailService.getAttachment(parsed.data, tx),
      { readOnly: true },
    );

    return new Response(new Uint8Array(file), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Length': String(file.length),
      },
    });
  } catch (error) {
    return new Response(null, {
      status: error instanceof ServiceError ? error.httpStatus : 500,
    });
  }
};

export const GET = download;
