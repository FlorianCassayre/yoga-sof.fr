import { POST, jsonFetch } from './utils';

// CRUD

export const getAdmins = query => jsonFetch('/api/adminWhitelists', { query });

export const getUsers = query => jsonFetch('/api/users', { query });
export const getUser = (id, query) => jsonFetch(`/api/users/${id}`, { query });

export const getCourseModels = query => jsonFetch('/api/courseModels', { query });

export const getCourses = query => jsonFetch('/api/courses', { query });
export const getCourse = (id, query) => jsonFetch(`/api/courses/${id}`, { query });

export const getCourseRegistrations = query => jsonFetch('/api/courseRegistrations', { query });
export const postCancelCourseRegistration = id => jsonFetch(`/api/courseRegistrations/${id}/cancel`, { method: POST });

export const getEmailMessages = query => jsonFetch('/api/emailMessages', { query });

export const getBundle = (id, query) => jsonFetch(`/api/courseBundles/${id}`, { query });

// Other

export const postCourseBatch = data => jsonFetch('/api/courseBatch', { method: POST, body: data });

export const postCancelCourse = (id, data = {}) => jsonFetch(`/api/courses/${id}/cancel`, { method: POST, body: data });

export const postUserDisabled = (id, data) => jsonFetch(`/api/users/${id}/disabled`, { method: POST, body: data });
