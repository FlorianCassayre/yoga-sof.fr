import { TRPCError } from '@trpc/server';
import type { Permission } from '@yoga-sof/core';
import { roleService, withTransaction } from '@yoga-sof/core/server';
import { auth } from '@yoga-sof/ui/auth';
import { trpc } from '@yoga-sof/ui/trpc';

// A function declaration: TS 6 only narrows through never-returning calls
// whose callee is hoisted.
function forbid(): never {
  throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès refusé.' });
}

const requirePermission = (permission: Permission) =>
  trpc.procedure.use(async ({ next }) => {
    const id = (await auth())?.user?.id;
    if (id === undefined) {
      forbid();
    }
    const allowed = await withTransaction((tx) => roleService.hasPermission(id, permission, tx), {
      readOnly: true,
    });
    if (!allowed) {
      forbid();
    }

    return next({ ctx: { userId: id } });
  });

export const readProcedure = requirePermission('readData');

export const writeProcedure = requirePermission('manageData');

export const settingsProcedure = requirePermission('manageSettings');
