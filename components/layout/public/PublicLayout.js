import { NotificationsOverlay } from '../../NotificationsOverlay';
import { HeadMeta } from '../HeadMeta';
import { FooterLayout } from './FooterLayout';
import { NavigationLayout } from './NavigationLayout';

export function PublicLayout({ children, padNavbar, title }) {

  return (
    <div className="d-flex flex-column min-vh-100">
      <HeadMeta title={`${title} - Yoga Sof`} />

      <NotificationsOverlay marginTop="3.5rem" />

      <NavigationLayout />

      {padNavbar && (
        <div style={{ height: '56px' }} />
      )}

      {children}

      <FooterLayout />
    </div>
  );
}
