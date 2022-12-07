import { trpc } from '../../common/trpc';
import { AppRouter, inferProcedures } from '../../server/controllers';
import { inferHandlerInput } from '@trpc/server';
import { TRPCClientErrorLike } from '@trpc/client';
import { UseQueryResult } from 'react-query';
import { UseTRPCQueryOptions } from '@trpc/react/dist/declarations/src/createReactQueryHooks';
import { z } from 'zod';
import { ZodTypeDef } from 'zod/lib/types';

export const useSchemaQuery =
  <TPath extends keyof AppRouter["_def"]["queries"] & string,
    TQueryFnData = inferProcedures<AppRouter["_def"]["queries"]>[TPath]["output"],
    TData = inferProcedures<AppRouter["_def"]["queries"]>[TPath]["output"],
    TCustom = inferProcedures<AppRouter["_def"]["queries"]>[TPath]["input"]>
  (pathAndInput: [path: TPath, args: TCustom],
    schema: z.ZodType<inferProcedures<AppRouter["_def"]["queries"]>[TPath]["input"], ZodTypeDef, TCustom>,
    opts?: UseTRPCQueryOptions<TPath, inferProcedures<AppRouter["_def"]["queries"]>[TPath]["input"], TQueryFnData, TData, TRPCClientErrorLike<AppRouter>> | undefined
  ): UseQueryResult<TData, TRPCClientErrorLike<AppRouter>> | null => {
    const parsed = schema.safeParse(pathAndInput[1]);
    if (parsed.success) {
      return trpc.useQuery([pathAndInput[0], ...([parsed.data] as inferHandlerInput<AppRouter["_def"]["queries"][TPath]>)], opts);
    } else {
      return null;
    }
};
