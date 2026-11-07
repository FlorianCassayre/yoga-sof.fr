import { TRPCError } from '@trpc/server';
import type { Permission } from '@yoga-sof/core';
import { roleService, withTransaction } from '@yoga-sof/core/server';
import { auth } from '@yoga-sof/ui/auth';
import { trpc } from '@yoga-sof/ui/trpc';

const forbid = () => {
  throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès refusé.' });
};

const requirePermission = (permission: Permission) =>
  trpc.procedure.use(async ({ next }) => {
    const id = (await auth())?.user?.id;
    const allowed = id
      ? await withTransaction((tx) => roleService.hasPermission(id, permission, tx), {
          readOnly: true,
        })
      : false;

    if (!allowed) {
      forbid();
    }

    return next();
  });

export const panelProcedure = requirePermission('adminPanel');

export const readProcedure = requirePermission('readData');

export const writeProcedure = requirePermission('manageData');

export const settingsProcedure = requirePermission('manageSettings');
