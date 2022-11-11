import React from 'react';
import { BackofficeContent } from '../../../../../components/layout/admin/BackofficeContent';
import { Assignment, Edit, EmojiPeople, Event, Notes } from '@mui/icons-material';
import { Course } from '@prisma/client';
import { useRouter } from 'next/router';
import { useSchemaQuery } from '../../../../../components/hooks/useSchemaQuery';
import { courseFindTransformSchema } from '../../../../../lib/common/newSchemas/course';
import { displayCourseName } from '../../../../../lib/common/newDisplay';
import { CourseRegistrationEventGrid } from '../../../../../components/grid/grids/CourseRegistrationEventGrid';
import { CourseRegistrationGrid } from '../../../../../components/grid/grids/CourseRegistrationGrid';
import { Typography } from '@mui/material';

interface CourseContentProps {
  course: Course;
}

const CourseContent: React.FunctionComponent<CourseContentProps> = ({ course }: CourseContentProps) => {
  return (
    <BackofficeContent
      title={displayCourseName(course)}
      icon={<Event />}
      actions={[
        { name: 'Modifier mes notes', icon: <Notes /> },
        { name: `Faire l'appel`, icon: <EmojiPeople /> },
        { name: 'Modifier la séance', icon: <Edit /> },
        { name: 'Inscrire des utilisateurs', icon: <Assignment />, url: { pathname: `/administration/inscriptions/creation`, query: { courseId: course.id } } },
      ]}
    >
      {JSON.stringify(course)}
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Inscriptions à cette séance
      </Typography>
      <CourseRegistrationGrid courseId={course.id} />
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Historique d'inscriptions à cette séance
      </Typography>
      <CourseRegistrationEventGrid courseId={course.id} />
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
