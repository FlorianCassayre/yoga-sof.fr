import { CourseType } from '@prisma/client';
import { CourseTypeNames } from '../../../common/course';
import React from 'react';
import { coursesExplicit } from '../../../../contents/courses';

export interface CourseDataExplicit {
  notStarted?: boolean;
  isRegistrationOnline?: boolean;
  anchor: string;
  age: string;
  level: string;
  group: string;
  duration: string;
  price: string;
  location: React.ReactNode;
  stuff: string;
  registration: string;
}

interface CourseData extends CourseDataExplicit {
  notStarted: boolean;
  isRegistrationOnline: boolean;
  type: CourseType;
  title: string;
}

export const courses: Record<CourseType, CourseData> =
  Object.fromEntries(Object.entries(coursesExplicit).map(([key, value]) =>
    [key, { ...value, type: key, title: CourseTypeNames[key as CourseType], notStarted: !!value.notStarted, isRegistrationOnline: !!value.isRegistrationOnline }])
  ) as Record<CourseType, CourseData>;
