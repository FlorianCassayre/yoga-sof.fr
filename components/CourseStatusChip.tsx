import React from 'react';
import { Course } from '@prisma/client';
import { getCourseStatus } from '../lib/common/course';
import { Chip } from '@mui/material';

interface CourseStatusChipProps {
  course: Course;
}

export const CourseStatusChip: React.FC<CourseStatusChipProps> = ({ course }) => {
  const status = getCourseStatus(course);
  return course.isCanceled ? (
    <Chip label="Annulée" color="error" variant="outlined" />
  ) : status.isBeforeStart ? (
    <Chip label="À venir" color="primary" variant="outlined" />
  ) : !status.isAfterEnd ? (
    <Chip label="En cours" color="success" variant="outlined" />
  ) : (
    <Chip label="Passée" color="default" variant="outlined" />
  );
};
