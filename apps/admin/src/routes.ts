import type { Route } from 'next';

import type { AppRoutes } from '../.next/types/routes';

// Turns the [param] segments of the generated routes into ${string} slots.
type RouteOf<R extends string> = R extends `${infer head}[${string}]${infer tail}`
  ? RouteOf<`${head}${string}${tail}`>
  : R;

type Hrefs = { [R in AppRoutes]: RouteOf<R> }[AppRoutes];

// next/link's Route only covers static routes when its type argument is left
// unresolved; the dynamic patterns have to be unioned in explicitly.
export type AppRoute = Route | Hrefs;
