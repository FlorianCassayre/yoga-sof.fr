import { jsonFetch } from './utils';

export const getSessionsSchedule = () => jsonFetch('/api/sessions_schedule');
