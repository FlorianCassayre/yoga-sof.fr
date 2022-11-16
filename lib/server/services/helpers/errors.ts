export enum ServiceErrorCode {
  FewerSlotsThanRegistered,
  CourseAlreadyCanceled,
  CourseHasPassed,
  CalendarNotFound,
  CalendarNotAllowed,
}

export class ServiceError<T extends ServiceErrorCode> extends Error {
  constructor(public readonly code: T) {
    super(`${ServiceErrorCodeMessages[code]}`);
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

export const ServiceErrorCodeMessages: { [K in ServiceErrorCode]: string } = {
  [ServiceErrorCode.FewerSlotsThanRegistered]: `Le nombre de places ne peut pas être inférieur au nombre d'inscrits`,
  [ServiceErrorCode.CourseAlreadyCanceled]: `La séance a déjà été annulée`,
  [ServiceErrorCode.CourseHasPassed]: `La séance est passée et ne peut pas être modifiée`,
  [ServiceErrorCode.CalendarNotFound]: `Le calendrier n'a pas été trouvé`,
  [ServiceErrorCode.CalendarNotAllowed]: `L'utilisateur n'est pas autorisé à accéder à ce calendrier`,
};
