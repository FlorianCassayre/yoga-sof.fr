import React from 'react';
import { CourseModelUpdateForm } from '../../../../../components/form/forms/courseModel';
import { useRouter } from 'next/router';

export default function CourseUpdate() {
  const router = useRouter();

  return (
    <CourseModelUpdateForm queryData={router.query} />
  );
}
