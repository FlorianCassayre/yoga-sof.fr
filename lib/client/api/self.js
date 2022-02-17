import { jsonFetch, POST } from './utils';

export const getSelfRegistrations = () => jsonFetch('/api/self/registrations');

export const postSelfCancelRegistration = (id) => jsonFetch(`/api/self/registrations/${id}/cancel`, { method: POST });

export const postSelfRegistrationBatch = (data) => jsonFetch('/api/self/registrations/batch', { method: POST, body: data });

export const getSelfUser = () => jsonFetch('/api/self/user');
export const postSelfUser = (data) => jsonFetch('/api/self/user', { method: POST, body: data });
