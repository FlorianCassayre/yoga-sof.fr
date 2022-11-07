import React from 'react';
import { BackofficeContent } from '../../../../../components/layout/admin/BackofficeContent';
import { Event } from '@mui/icons-material';
import { Course } from '@prisma/client';
import { useRouter } from 'next/router';
import { useSchemaQuery } from '../../../../../components/hooks/useSchemaQuery';
import { courseFindTransformSchema } from '../../../../../lib/common/newSchemas/course';
import { displayCourseName } from '../../../../../lib/common/newDisplay';
import { CourseCourseRegistrationGrid } from '../../../../../components/grid/grids/CourseCourseRegistrationGrid';

interface CourseContentProps {
  course: Course;
}

const CourseContent: React.FunctionComponent<CourseContentProps> = ({ course }: CourseContentProps) => {
  return (
    <BackofficeContent
      title={displayCourseName(course)}
      icon={<Event />}
    >
      {JSON.stringify(course)}
      <CourseCourseRegistrationGrid courseId={course.id} />
    </BackofficeContent>
  );
};

export default function AdminCourse() {
  const router = useRouter();
  const { id } = router.query;
  const result = useSchemaQuery(['course.find', { id }], courseFindTransformSchema);

  return result && result.data ? (
    <CourseContent course={result.data} />
  ) : null;
}
