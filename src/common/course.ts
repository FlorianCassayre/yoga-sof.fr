import { Course, CourseType, Prisma } from '@prisma/client';

export const CourseTypeNames: { [K in CourseType]: string } = {
  [CourseType.YOGA_ADULT]: 'Yoga adulte',
  [CourseType.YOGA_CHILD]: 'Yoga enfant',
  [CourseType.YOGA_ADULT_CHILD]: 'Yoga parent-enfant',
}

export const getCourseStatus = (course: Course) => {
  const currentTime = new Date().getTime();
  const addDays = (date: Date, days: number): Date => {
    const copy = new Date(date);
    copy.setDate(date.getDate() + days);
    return copy;
  };
  return {
    isBeforeStart: currentTime < new Date(course.dateStart).getTime(),
    isAfterEnd: currentTime > new Date(course.dateEnd).getTime(),
    isInExtendedPeriod: currentTime > addDays(new Date(course.dateStart), -1).getTime() && currentTime < addDays(new Date(course.dateEnd), 1).getTime(),
  };
};

export const getCourseStatusWithRegistrations = (course: Prisma.CourseGetPayload<{ include: { registrations: true } }>) => {
  const status = getCourseStatus(course);
  const registered = course.registrations.filter(registration => !registration.isUserCanceled).length;
  const attended = course.registrations.filter(registration => !registration.isUserCanceled && registration.attended).length;
  const presenceNotFilled = course.registrations.filter(registration => !registration.isUserCanceled && registration.attended === null).length > 0;
  return {
    ...status,
    registered,
    attended,
    presenceNotFilled,
    canRegister: !course.isCanceled && (status.isBeforeStart || status.isInExtendedPeriod) && registered < course.slots,
  };
};
