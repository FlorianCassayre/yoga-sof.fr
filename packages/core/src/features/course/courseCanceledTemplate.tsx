import type { EmailTemplate } from '../email/templates/EmailTemplate';
import { courseLabel } from './courseLabel';
import type { CourseType } from './type/CourseType';

export interface CourseCanceledEmailCourse {
  type: CourseType;
  startsAt: Date;
  endsAt: Date;
}

const lowerFirst = (value: string): string => value.charAt(0).toLowerCase() + value.slice(1);

export const COURSE_CANCELED_TEMPLATE: EmailTemplate<{
  course: CourseCanceledEmailCourse;
  cancellationReason: string | null;
}> = {
  type: 'sessionCanceled',
  subject: () => "Notification d'annulation de séance",
  body: ({ course, cancellationReason }) => (
    <>
      <p>La {lowerFirst(courseLabel(course))} a malheureusement été annulée.</p>
      {cancellationReason !== null && cancellationReason !== '' ? (
        <p>{cancellationReason}</p>
      ) : null}
      <p>Merci de votre compréhension.</p>
    </>
  ),
};
