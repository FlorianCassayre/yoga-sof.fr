import React from 'react';
import { useRouter } from 'next/router';
import { CourseUpdateForm } from '../../../../../components/form/forms/course';

export default function CourseUpdate() {
  const router = useRouter();

  return (
    <CourseUpdateForm queryData={router.query} />
  );
}
