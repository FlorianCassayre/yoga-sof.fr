import React from 'react';
import { Course } from '@prisma/client';
import { getCourseStatus } from '../common/course';
import { Chip } from '@mui/material';

interface CourseStatusChipProps {
  course: Pick<Course, 'isCanceled'> & Parameters<typeof getCourseStatus>[0];
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
