import { jsonFetch, POST } from './utils';

// CRUD

export const getAdmins = query => jsonFetch('/api/admins', { query });

export const getUsers = query => jsonFetch('/api/users', { query });
export const getUser = (id, query) => jsonFetch(`/api/users/${id}`, { query });

export const getSessionModels = query => jsonFetch('/api/session_models', { query });

export const getSessions = query => jsonFetch('/api/sessions', { query });
export const getSession = (id, query) => jsonFetch(`/api/sessions/${id}`, { query });

export const getRegistrations = query => jsonFetch('/api/registrations', { query });
export const postCancelRegistration = id => jsonFetch(`/api/registrations/${id}/cancel`, { method: POST });

export const getEmails = query => jsonFetch('/api/emails', { query });

// Other

export const postSessionBatch = data => jsonFetch('/api/session_batch', { method: POST, body: data });

export const postCancelSession = (id, data = {}) => jsonFetch(`/api/sessions/${id}/cancel`, { method: POST, body: data });
