import { RouteType } from '@premieroctet/next-crud';
import { USER_TYPE_ADMIN } from '../common';

export const isPermitted = (resourceType, resourceId, routeType, userType) => {
  /*
  RouteType.CREATE
  RouteType.READ_ALL
  RouteType.READ_ONE
  RouteType.UPDATE
  RouteType.DELETE
   */

  // For now the following is sufficient. Adapt as needed.
  if (userType === USER_TYPE_ADMIN) {
    if (resourceType === 'users') {
      return [RouteType.CREATE, RouteType.READ_ALL, RouteType.READ_ONE].includes(routeType);
    } else if (resourceType === 'admins') {
      return [RouteType.READ_ALL, RouteType.READ_ONE].includes(routeType);
    } else if (resourceType === 'session_models') {
      return true;
    } else if (resourceType === 'sessions') {
      return [RouteType.READ_ALL, RouteType.READ_ONE, RouteType.UPDATE].includes(routeType);
    } else if (resourceType === 'emails') {
      return [RouteType.READ_ALL, RouteType.READ_ONE].includes(routeType);
    } else if (resourceType === 'registrations') {
      return [RouteType.READ_ALL, RouteType.READ_ONE].includes(routeType);
    }
  }

  return false;
};
