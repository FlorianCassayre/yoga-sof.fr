import { USER_TYPE_ADMIN } from '../../../lib/common';
import { AuthGuard } from '../../AuthGuard';
import { HeadMeta } from '../HeadMeta';
import { NavigationLayout } from './NavigationLayout';

export function PrivateLayout({ children, pathname }) {
  return (
    <AuthGuard allowedUserTypes={[USER_TYPE_ADMIN]}>
      <div>
        <HeadMeta />

        <NavigationLayout pathname={pathname}>
          {children}
        </NavigationLayout>

      </div>
    </AuthGuard>
  );
}
