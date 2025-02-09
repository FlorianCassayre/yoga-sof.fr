import { notifyCourseNewcomers, notifyCourseWaitingList } from '../email';

export const executeDaily = async () => {
  const sendMailsCallback = await notifyCourseNewcomers();
  await sendMailsCallback();
};

export const executeHourly = async () => {
  const sendMailsCallback = await notifyCourseWaitingList();
  await sendMailsCallback();
};
