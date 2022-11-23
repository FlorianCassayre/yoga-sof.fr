import { POST, jsonFetch } from './utils';

// CRUD

export const postCancelCourseRegistration = id => jsonFetch(`/api/courseRegistrations/${id}/cancel`, { method: POST });

// Other
