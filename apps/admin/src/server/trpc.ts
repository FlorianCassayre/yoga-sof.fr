import { TRPCError } from '@trpc/server';
import { roleService, withTransaction } from '@yoga-sof/core/server';
import { auth } from '@yoga-sof/ui/auth';
import { trpc } from '@yoga-sof/ui/trpc';

const forbid = () => {
  throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès refusé.' });
};

export const panelProcedure = trpc.procedure.use(async ({ next }) => {
  const id = (await auth())?.user?.id;
  const allowed = id
    ? await withTransaction((tx) => roleService.hasPermission(id, 'adminPanel', tx), {
        readOnly: true,
      })
    : false;

  if (!allowed) {
    forbid();
  }

  return next();
});

export const adminProcedure = trpc.procedure.use(async ({ next }) => {
  const id = (await auth())?.user?.id;
  const role = id
    ? await withTransaction((tx) => roleService.getUserRole(id, tx), { readOnly: true })
    : null;

  if (role !== 'administrateur') {
    forbid();
  }

  return next();
});
