import { Serialize } from '@trpc/server/dist/shared/internal/serialize';
import { Procedure, ProcedureParams } from '@trpc/server/src/core/procedure';
import { AnyRootConfig } from '@trpc/server/src/core/internals/config';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { AppRouter } from './router';

type NonJsonPrimitive = undefined | Function | symbol;
export type ConvertInput<T> = T | (T extends NonJsonPrimitive ? null : Serialize<T>);

export type ProcedureQueryArray<TOutput, TInput = undefined> = Procedure<'query', ProcedureParams<AnyRootConfig, unknown, TInput, unknown, unknown, TOutput[], unknown>>;

export type InputIdentifier = { id: number | string };

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
