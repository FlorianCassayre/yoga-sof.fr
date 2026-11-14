import {
  type CourseType,
  courseTypeEnum,
  type CourseVisibility,
  courseVisibilityEnum,
  optionalPriceSchema,
  timeSchema,
} from '@yoga-sof/core';
import { z } from 'zod';

export interface CourseBundleOption {
  id: number;
  label: string;
  type: CourseType;
  price: number;
  capacity: number;
}

export interface CourseBatchTemplateValues {
  weekday: number;
  type: CourseType | null;
  startTime: string;
  endTime: string;
  capacity: string;
  price: string;
}

export interface CourseBatchFormValues {
  visibility: CourseVisibility;
  bundle: CourseBundleOption | null;
  capacity: string;
  templates: CourseBatchTemplateValues[];
  weeks: string[];
}

export const courseBatchFormSchema = z
  .object({
    visibility: z.enum(courseVisibilityEnum.enumValues),
    bundle: z.object({ id: z.number().int() }).nullable(),
    capacity: z.preprocess(
      (value) => (value === '' || value === null ? undefined : value),
      z.coerce.number().int().min(0).optional(),
    ),
    templates: z.array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        type: z.enum(courseTypeEnum.enumValues).nullable(),
        startTime: timeSchema,
        endTime: timeSchema,
        capacity: z.preprocess(
          (value) => (value === '' || value === null ? undefined : value),
          z.coerce.number().int().min(0).optional(),
        ),
        price: optionalPriceSchema,
      }),
    ),
    weeks: z.array(z.string().date()),
  })
  .superRefine(({ bundle, capacity, templates }, ctx) => {
    templates.forEach((template, index) => {
      if (template.endTime <= template.startTime) {
        ctx.addIssue({
          code: 'custom',
          path: ['templates', index, 'endTime'],
          message: "L'heure de fin doit être postérieure à l'heure de début.",
        });
      }
      if (bundle === null) {
        if (template.type === null) {
          ctx.addIssue({
            code: 'custom',
            path: ['templates', index, 'type'],
            message: 'Le type est requis.',
          });
        }
        if (template.capacity === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: ['templates', index, 'capacity'],
            message: 'La capacité est requise.',
          });
        }
        if (template.price === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: ['templates', index, 'price'],
            message: 'Le prix est requis.',
          });
        }
      }
    });
    if (bundle !== null && capacity === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['capacity'],
        message: 'La capacité est requise.',
      });
    }
  })
  .transform(({ bundle, capacity, templates, ...rest }) => ({
    ...rest,
    capacity: bundle === null ? undefined : capacity,
    templates: templates.map(({ type, price, capacity, ...template }) =>
      bundle === null
        ? {
            ...template,
            type: type ?? undefined,
            capacity,
            price,
          }
        : { ...template, bundleId: bundle.id },
    ),
  }));
