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
    }
    if (resourceType === 'adminWhitelists') {
      return [RouteType.READ_ALL, RouteType.READ_ONE].includes(routeType);
    }
    if (resourceType === 'courseModels') {
      return true;
    }
    if (resourceType === 'courses') {
      return [RouteType.READ_ALL, RouteType.READ_ONE, RouteType.UPDATE].includes(routeType);
    }
    if (resourceType === 'emailMessages') {
      return [RouteType.READ_ALL, RouteType.READ_ONE].includes(routeType);
    }
    if (resourceType === 'courseRegistrations') {
      return [RouteType.READ_ALL, RouteType.READ_ONE].includes(routeType);
    }
    if (resourceType === 'courseBundles') {
      return [RouteType.READ_ALL, RouteType.READ_ONE, RouteType.UPDATE];
    }
  }

  return false;
};
