import { ZodErrorMap, ZodIssueCode, ZodParsedType } from 'zod';

const util = {
  jsonStringifyReplacer: (_: string, value: any): any => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  },
  joinValues: <T extends any[]>(
    array: T,
    separator = " | "
  ): string => {
    return array
      .map((val) => (typeof val === "string" ? `'${val}'` : val))
      .join(separator);
  },
  assertNever: (_x: never): never => {
    throw new Error();
  },
}

// See https://github.com/colinhacks/zod/blob/master/src/locales/en.ts

export const zodFrenchErrorMap: ZodErrorMap = (issue, _ctx) => {
  let message: string = '';
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Requis";
      } else {
        message = `Était attendu ${issue.expected}, reçu ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Valeur littérale invalide, était attendu ${JSON.stringify(
        issue.expected,
        util.jsonStringifyReplacer
      )}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Clé(s) inconnue(s) dans l'objet : ${util.joinValues(
        issue.keys,
        ", "
      )}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Entrée invalide`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Discriminateur inconnu. Était attendu ${util.joinValues(
        issue.options
      )}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Valeur d'énumération inconnue. Était attendu ${util.joinValues(
        issue.options
      )}, reçu '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Arguments de fonction inconnus`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Type de retour de fonction inconnu`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Date invalide`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Entrée invalidate : doit contenir "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} à une ou plusieurs positions supérieures ou égales à ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Entrée invalide : doit commencer par "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Entrée invalide : doit se terminer par "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `${issue.validation[0].toUpperCase() + issue.validation.slice(1)} invalide`;
      } else {
        message = "Invalide";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `La liste doit contenir ${
          issue.inclusive ? `au moins` : `plus de`
        } ${issue.minimum !== 1 ? issue.minimum : 'un'} élément${issue.minimum > 1 ? 's' : ''}`;
      else if (issue.type === "string")
        message = `L'entrée doit contenir ${
          issue.inclusive ? `au moins` : `plus de`
        } ${issue.minimum !== 1 ? issue.minimum : 'un'} caractère${issue.minimum > 1 ? 's' : ''}`;
      else if (issue.type === "number")
        message = `Le nombre doit être supérieur ${
          issue.inclusive ? `ou égal ` : ``
        }à ${issue.minimum}`;
      else if (issue.type === "date")
        message = `La date doit être postérieure ${
          issue.inclusive ? `ou égale ` : ``
        }à ${new Date(Number(issue.minimum))}`;
      else message = "Entrée invalide";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `La liste doit contenir ${
          issue.inclusive ? `au plus` : `moins de`
        } ${issue.maximum !== 1 ? issue.maximum : 'un'} élément${issue.maximum > 1 ? 's' : ''}`;
      else if (issue.type === "string")
        message = `L'entrée doit contenir ${
          issue.inclusive ? `au plus` : `moins de`
        } ${issue.maximum !== 1 ? issue.maximum : 'un'} caractère${issue.maximum > 1 ? 's' : ''}`;
      else if (issue.type === "number")
        message = `Le nombre doit être inférieur ${
          issue.inclusive ? `ou égal ` : ``
        }à ${issue.maximum}`;
      else if (issue.type === "date")
        message = `La date doit être antérieure ${
          issue.inclusive ? `ou égale ` : ``
        }à ${new Date(Number(issue.maximum))}`;
      else message = "Entrée invalide";
      break;
    case ZodIssueCode.custom:
      message = `Entrée invalide`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Les résultats de l'intersection n'ont pas pu être fusionnés`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Le nombre doit être un multiple de ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Le nombre doit être fini";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
