import { isSameDay } from 'date-fns';
import Joi from 'joi';
import { SESSIONS_TYPES } from './sessions';

const id = Joi.number().integer();

export const schemaSelfRegistrationBatchBody = Joi.object({
  sessions: Joi.array().required().min(1).max(100).unique().items(id.required()),
});

export const schemaSelfRegistrationCancelQuery = Joi.object({
  id: id.required(),
});

export const schemaSelfUserBody = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email({ tlds: { allow: false } }).allow(null).required(),
  receive_emails: Joi.boolean().required(),
});

export const schemaSessionCancelQuery = Joi.object({
  id: id.required(),
});

export const schemaSessionCancelBody = Joi.object({
  cancelation_reason: Joi.string().optional(),
});

export const schemaRegisterBody = Joi.object({
  user_id: id.required(),
  session_id: id.required(),
});

export const schemaCalendarQuery = Joi.object({
  id: id.required(),
  token: Joi.string().required(),
});

export const schemaSessionBatchBody = Joi.object({
  model_id: Joi.string(), // Optional (not needed actually)
  type: Joi.string().valid(...SESSIONS_TYPES.map(({ id }) => id)).required(),
  slots: Joi.number().integer().min(1).required(),
  price: Joi.number().integer().min(0).required(),
  dates: Joi.array().items(Joi.array().items(Joi.number().integer().required()).min(2).max(2).required().custom(([t0, t1], helper) => {
    if(!isSameDay(new Date(t1), new Date(t1))) {
      return helper.message('Dates must occur on the same day');
    } else if(t0 >= t1) {
      return helper.message('Dates must be a strictly positive interval');
    } else {
      return true;
    }
  })).required(),
});

export const schemaRegistrationCancelQuery = Joi.object({
  id: id.required(),
});
