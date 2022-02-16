import { USER_TYPE_ADMIN } from '../../../lib/common';
import { AuthGuard } from '../../AuthGuard';
import { NotificationsOverlay } from '../../NotificationsOverlay';
import { HeadMeta } from '../HeadMeta';
import { NavigationLayout } from './NavigationLayout';

export function PrivateLayout({ children }) {

  return (
    <AuthGuard allowedUserTypes={[USER_TYPE_ADMIN]}>
      <NotificationsOverlay />

      <div>
        <HeadMeta />

        <NavigationLayout>
          {children}
        </NavigationLayout>

      </div>
    </AuthGuard>
  );
}
