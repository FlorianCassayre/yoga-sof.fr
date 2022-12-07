import { Course, CourseRegistration, EmailMessageType } from '@prisma/client';
import { displayCourseName, displayUserName } from './display';
import React from 'react';
import { urlForLocation } from './urls';
import { LocationHome } from './config';

export const EmailMessageTypeNames: { [K in EmailMessageType]: string } = {
  [EmailMessageType.SESSION_CANCELED]: 'Annulation de séance',
  [EmailMessageType.SESSION_REMINDER_NEWCOMER]: 'Rappel de séance pour nouveaux arrivants',
  [EmailMessageType.SESSION_REGISTRATION]: 'Inscription à des séances',
  [EmailMessageType.OTHER]: 'Autre',
};

export type EmailMessageTemplate<Props extends {}> = {
  type: EmailMessageType;
  subject: (props: Props) => string;
  body: (props: Props) => React.ReactElement;
};

export type EmailMessageWithContentTemplate<Props,> = EmailMessageTemplate<Props & { user: Parameters<typeof displayUserName>[0], casual?: boolean }>;

export type inferEmailProps<MessageTemplate> = MessageTemplate extends EmailMessageTemplate<infer Props> ? Props : never;
