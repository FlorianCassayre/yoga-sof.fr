import { isSameDay } from 'date-fns';
import Joi from 'joi';
import { COURSE_TYPES } from './courses';

const schemaId = Joi.number().integer();
const schemaEmail = Joi.string().email({ tlds: { allow: false } });

export const schemaSelfRegistrationBatchBody = Joi.object({
  courses: Joi.array().required().min(1).max(100)
    .unique()
    .items(schemaId.required()),
});

export const schemaSelfRegistrationCancelQuery = Joi.object({ id: schemaId.required() });

export const schemaSelfUserBody = Joi.object({
  customName: Joi.string().required(),
  customEmail: schemaEmail.allow(null).required(),
  receiveEmails: Joi.boolean().required(),
});

export const schemaCourseQuery = Joi.object({ id: schemaId.required() });

export const schemaCourseCancelBody = Joi.object({ cancelationReason: Joi.string().optional() });

export const schemaCourseAttendedBody = Joi.object({ cancelationReason: Joi.string().optional() });

export const schemaRegisterBody = Joi.object({
  userId: schemaId.required(),
  courseId: schemaId.required(),
});

export const schemaCalendarQuery = Joi.object({
  id: schemaId, // .required(),
  token: Joi.string().required(),
  coach: Joi.string().valid(''),
});

export const schemaCourseBatchBody = Joi.object({
  modelId: Joi.string(), // Optional (not needed actually)
  type: Joi.string()
    .valid(...COURSE_TYPES.map(({ id }) => id))
    .required(),
  slots: Joi.number().integer().min(1).required(),
  price: Joi.number().integer().min(0).required(),
  bundle: Joi.boolean().required(),
  bundleName: Joi.string().when('bundle', { is: Joi.valid(true), then: Joi.required(), otherwise: Joi.forbidden() }),
  dates: Joi.array()
    .items(
      Joi.array()
        .items(Joi.number().integer().required())
        .min(2)
        .max(2)
        .required()
        .custom(([t0, t1], helper) => {
          if (!isSameDay(new Date(t1), new Date(t1))) {
            return helper.message('Dates must occur on the same day');
          }
          if (t0 >= t1) {
            return helper.message('Dates must be a strictly positive interval');
          }
          return true;
        }),
    )
    .required(),
});

export const schemaRegistrationQuery = Joi.object({ id: schemaId.required() });

export const schemaRegistrationAttendedBody = Joi.object({ attended: Joi.boolean().allow(null).required() });

export const schemaSignInExternal = Joi.object({});

export const schemaSignInEmail = Joi.object({
  email: schemaEmail.required(),
});

export const schemaUserQuery = Joi.object({ id: schemaId.required() });

export const schemaUserBody = Joi.object({
  name: Joi.string().required(),
  email: schemaEmail.allow(null).required(),
});

export const schemaUserDisabledBody = Joi.object({
  disabled: Joi.boolean().required(),
});
