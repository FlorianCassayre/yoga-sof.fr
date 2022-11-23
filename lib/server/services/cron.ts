import { notifyCourseNewcomers } from '../newEmail';

export const executeDaily = async () => {
  await notifyCourseNewcomers();
};
