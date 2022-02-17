import { Toast, ToastContainer } from 'react-bootstrap';
import { BsCheckLg } from 'react-icons/bs';
import { useNotificationsContext } from '../state';

export function NotificationsOverlay({ marginTop }) {
  const { notifications, deleteNotification } = useNotificationsContext();

  return (
    <ToastContainer position="top-end" className="p-3 position-fixed" style={{ zIndex: 99999, marginTop }}>
      {notifications.map(({ id, title, body, variant = 'success', icon: Icon, mounted, hidden }) => (
        <Toast key={id} show={mounted && !hidden} onClose={() => deleteNotification(id)} bg={variant}>
          <Toast.Header>
            <strong className="me-auto">
              {Icon ? <Icon className="icon me-2" /> : variant === 'success' && <BsCheckLg className="icon me-2" />}
              {title}
            </strong>
            {/*<small className="text-muted">à l'instant</small>*/}
          </Toast.Header>
          <Toast.Body className="text-white">{body}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
}
