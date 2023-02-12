import { notifyCourseNewcomers } from '../email';

export const executeDaily = async () => {
  const sendMailsCallback = await notifyCourseNewcomers();
  await sendMailsCallback();
};
