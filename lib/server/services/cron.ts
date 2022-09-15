import { notifyCourseNewcomers } from '../email';

export const executeDaily = async () => {
  await notifyCourseNewcomers();
};
