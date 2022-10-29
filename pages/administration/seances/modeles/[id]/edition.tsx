import React from 'react';
import { CourseModelUpdateForm } from '../../../../../components/form/forms/course';
import { useRouter } from 'next/router';

export default function CourseModelUpdate() {
  const router = useRouter();

  return (
    <CourseModelUpdateForm queryData={router.query} />
  );
}
