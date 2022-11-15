// IMPORTANT! This file is autogenerated by the `type-safe-next-routes` 
// package. You should _not_ update these types manually...

declare module "next-type-safe-routes" {
  type Query = { [key: string]: any };
  export type TypeSafePage = "/404" | { route: "/404", query?: Query } | "/administration/administrateurs" | { route: "/administration/administrateurs", query?: Query } | "/administration/emails" | { route: "/administration/emails", query?: Query } | "/administration" | { route: "/administration", query?: Query } | "/administration/inscriptions/creation" | { route: "/administration/inscriptions/creation", query?: Query } | "/administration/inscriptions" | { route: "/administration/inscriptions", query?: Query } | "/administration/parametres" | { route: "/administration/parametres", query?: Query } | "/administration/seances" | { route: "/administration/seances", query?: Query } | { route: "/administration/seances/modeles/[id]/edition", params: { "id": string | number }, query?: Query } | "/administration/seances/modeles/creation" | { route: "/administration/seances/modeles/creation", query?: Query } | { route: "/administration/seances/planning/[id]/edition", params: { "id": string | number }, query?: Query } | { route: "/administration/seances/planning/[id]", params: { "id": string | number }, query?: Query } | { route: "/administration/seances/planning/[id]/notes", params: { "id": string | number }, query?: Query } | "/administration/seances/planning/creation" | { route: "/administration/seances/planning/creation", query?: Query } | { route: "/administration/utilisateurs/[id]/edition", params: { "id": string | number }, query?: Query } | { route: "/administration/utilisateurs/[id]", params: { "id": string | number }, query?: Query } | "/administration/utilisateurs/creation" | { route: "/administration/utilisateurs/creation", query?: Query } | "/administration/utilisateurs" | { route: "/administration/utilisateurs", query?: Query } | "/confidentialite" | { route: "/confidentialite", query?: Query } | "/connexion" | { route: "/connexion", query?: Query } | "/" | { route: "/", query?: Query } | "Test" | { route: "Test", query?: Query } | "/redirection" | { route: "/redirection", query?: Query } | "/reglement-interieur" | { route: "/reglement-interieur", query?: Query } | "/seances" | { route: "/seances", query?: Query } | "/test" | { route: "/test", query?: Query } | "/verification" | { route: "/verification", query?: Query };
  export type TypeSafeApiRoute = { route: "/api/auth", path: string, query?: Query } | "/api/calendar.ics" | { route: "/api/calendar.ics", query?: Query } | { route: "/api/trpc/[trpc]", params: { "trpc": string | number }, query?: Query };
  export const getPathname: (typeSafeUrl: TypeSafePage | TypeSafeApiRoute) => string;
  export const getRoute: (typeSafeUrl: TypeSafePage | TypeSafeApiRoute) => string;
}
