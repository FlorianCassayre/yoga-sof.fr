import { courseLabel, type CourseType } from '@yoga-sof/core';

import { Link } from '../../components/link/Link';
import { CourseIcon } from './CourseIcon';

interface CourseLinkProps {
  course: {
    id: number;
    type: CourseType;
    startsAt: Date;
    endsAt: Date;
  };
}

export const CourseLink = ({ course }: CourseLinkProps) => (
  <Link
    href={`/seances/${course.id}`}
    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, verticalAlign: 'middle' }}
  >
    <CourseIcon size={16} />
    {courseLabel(course)}
  </Link>
);
