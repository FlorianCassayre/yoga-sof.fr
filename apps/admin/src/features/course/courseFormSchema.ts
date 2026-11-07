import { courseTypeEnum, courseVisibilityEnum } from '@yoga-sof/core';
import { z } from 'zod';

const combineDateTime = (date: Date | null, time: Date | null): Date | null =>
  date === null || time === null
    ? null
    : new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes(),
      );

export const courseFormSchema = z
  .object({
    type: z.enum(courseTypeEnum.enumValues),
    date: z.date().nullable(),
    startTime: z.date().nullable(),
    endTime: z.date().nullable(),
    capacity: z.preprocess(
      (value) => (value === '' || value === null ? undefined : value),
      z.coerce.number(),
    ),
    visibility: z.enum(courseVisibilityEnum.enumValues),
    internalNotes: z.string(),
  })
  .refine(({ date }) => date !== null, {
    path: ['date'],
    message: 'Sélectionnez une date.',
  })
  .refine(({ startTime }) => startTime !== null, {
    path: ['startTime'],
    message: 'Sélectionnez une heure de début.',
  })
  .refine(({ endTime }) => endTime !== null, {
    path: ['endTime'],
    message: 'Sélectionnez une heure de fin.',
  })
  .refine(
    ({ startTime, endTime }) =>
      startTime === null || endTime === null || startTime.getTime() < endTime.getTime(),
    { path: ['endTime'], message: "L'heure de fin doit être postérieure à l'heure de début." },
  )
  .transform(({ date, startTime, endTime, ...rest }) => ({
    ...rest,
    startsAt: combineDateTime(date, startTime),
    endsAt: combineDateTime(date, endTime),
  }));
