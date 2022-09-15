import React from 'react';
import { RichLink } from './RichLink';
import { displayCourseName, displayUserName } from '../../lib/common/display';
import { Event, Person } from '@mui/icons-material';
import { Course } from '@prisma/client';

interface CourseLinkProps {
  course: Pick<Course, 'id' | 'type' | 'dateStart' | 'dateEnd'>;
}

export const CourseLink: React.FC<CourseLinkProps> = ({ course }) => {
  return (
    <RichLink url={{ pathname: '/administration/seances/planning/[id]', query: { id: course.id } }} icon={<Event />}>
      {displayCourseName(course)}
    </RichLink>
  );
};
