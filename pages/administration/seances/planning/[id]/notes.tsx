import React from 'react';
import { useRouter } from 'next/router';
import { CourseUpdateForm, CourseUpdateNotesForm } from '../../../../../components/form/forms/course';

export default function CourseUpdate() {
  const router = useRouter();

  return (
    <CourseUpdateNotesForm queryData={router.query} />
  );
}
