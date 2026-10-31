'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { CourseCalendar } from '../course/calendar/CourseCalendar';
import { DashboardIcon } from './DashboardIcon';

export const DashboardPage = () => (
  <PageLayout icon={DashboardIcon} title="Aperçu">
    <CourseCalendar />
  </PageLayout>
);
