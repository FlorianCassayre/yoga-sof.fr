import { courseLabel, type CourseType } from '../course';
import type { EmailTemplate } from '../email/templates/EmailTemplate';

export interface RegistrationEmailCourse {
  type: CourseType;
  startsAt: Date;
  endsAt: Date;
}

export interface RegistrationEmailRegistration {
  id: number;
  course: RegistrationEmailCourse;
}

export const COURSE_USER_REGISTRATION_CONFIRMATION_TEMPLATE: EmailTemplate<{
  registrations: RegistrationEmailRegistration[];
}> = {
  type: 'sessionRegistration',
  subject: ({ registrations }) =>
    registrations.length !== 1
      ? 'Vos inscriptions à des séances de yoga'
      : 'Votre inscription à une séance de yoga',
  body: ({ registrations }) => (
    <>
      <p>
        J'ai le plaisir de vous confirmer{' '}
        {registrations.length !== 1
          ? 'vos inscriptions aux séances de yoga suivantes :'
          : 'votre inscription à la séance de yoga suivante :'}
      </p>
      <ul>
        {[...registrations]
          .sort((left, right) => left.course.startsAt.getTime() - right.course.startsAt.getTime())
          .map(({ id, course }) => (
            <li key={id}>{courseLabel(course)}</li>
          ))}
      </ul>
      <p>
        S'il s'agit de votre première participation, des informations pratiques vous seront
        communiquées la veille de votre séance.
      </p>
      <p>Je me réjouis d'avance de vous y retrouver.</p>
    </>
  ),
};
