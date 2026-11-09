import { courseLabel, type CourseType } from '../course';
import type { EmailTemplate } from '../email/templates/EmailTemplate';

export interface WaitingListEmailCourse {
  type: CourseType;
  startsAt: Date;
  endsAt: Date;
}

// "Pour la Séance adulte du ..." would read wrong — the label is lowercased
// when it follows the leading article.
const lowerCourseLabel = (course: WaitingListEmailCourse): string =>
  courseLabel(course).charAt(0).toLowerCase() + courseLabel(course).slice(1);

export const COURSE_WAITING_LIST_TEMPLATE: EmailTemplate<{ course: WaitingListEmailCourse }> = {
  type: 'courseWaitingList',
  subject: ({ course }) => `Place disponible pour la ${lowerCourseLabel(course)}`,
  body: ({ course }) => (
    <>
      <p>
        Vous aviez demandé à être notifié(e) des disponibilités de la {lowerCourseLabel(course)}.
      </p>
      <p>
        Nous avons le plaisir de vous informer qu'une place vient de se libérer.
        <br />
        Vous pouvez à présent vous y inscrire en suivant{' '}
        <a href={`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/inscription`}>ce lien</a>.
      </p>
    </>
  ),
};
