import { jsonFetch } from './utils';

export const getCoursesSchedule = () => jsonFetch('/api/coursesSchedule');
