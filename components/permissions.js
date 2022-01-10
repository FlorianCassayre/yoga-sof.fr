import { RouteType } from '@premieroctet/next-crud';
import { USER_TYPE_ADMIN } from './session';

export const isPermitted = (resourceType, resourceId, routeType, userType) => {
  /*
  RouteType.CREATE
  RouteType.READ_ALL
  RouteType.READ_ONE
  RouteType.UPDATE
  RouteType.DELETE
   */

  // For now the following is sufficient. Adapt as needed.
  if(userType === USER_TYPE_ADMIN) {
    if(resourceType === 'users') {
      return [RouteType.READ_ALL, RouteType.READ_ONE].includes(routeType);
    } else if(resourceType === 'admins') {
      return [RouteType.READ_ALL, RouteType.READ_ONE].includes(routeType);
    } else if(resourceType === 'session_models') {
      return true;
    }
  }

  return false;
}
