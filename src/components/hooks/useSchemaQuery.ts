import { inferProcedureInput } from '@trpc/server';
import { TRPCClientErrorLike } from '@trpc/client';
import { z } from 'zod';
import { ZodTypeDef } from 'zod/lib/types';
import { DecorateProcedure, UseTRPCQueryOptions, UseTRPCQueryResult } from '@trpc/react-query/shared';
import { inferTransformedProcedureOutput } from '@trpc/server/shared';
import { AnyQueryProcedure } from '@trpc/server/src/core/procedure';

export const useSchemaQuery =
  <TProcedure extends AnyQueryProcedure,
    TQueryFnData = inferTransformedProcedureOutput<TProcedure>,
    TData = inferTransformedProcedureOutput<TProcedure>,
    TCustom = inferProcedureInput<TProcedure>>
  (procedure: DecorateProcedure<TProcedure, any, any>,
    input: TCustom,
    schema: z.ZodType<inferProcedureInput<TProcedure>, ZodTypeDef, TCustom>,
    opts?: UseTRPCQueryOptions<
      any,
      inferProcedureInput<TProcedure>,
      TQueryFnData,
      TData,
      TRPCClientErrorLike<TProcedure>
      >
  ): UseTRPCQueryResult<TData, TRPCClientErrorLike<TProcedure>> | null => {
    const parsed = schema.safeParse(input);
    if (parsed.success) {
      return procedure.useQuery(parsed.data, opts);
    } else {
      return null;
    }
};
