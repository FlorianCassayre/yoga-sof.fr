import { jsonFetch, POST } from './utils';

export const getSelfRegistrations = () => jsonFetch('/api/self/registrations');

export const postCancelRegistration = id => jsonFetch(`/api/self/registrations/${id}/cancel`, { method: POST });

export const postRegistrationBatch = data => jsonFetch('/api/self/registrations/batch', { method: POST, body: data });
