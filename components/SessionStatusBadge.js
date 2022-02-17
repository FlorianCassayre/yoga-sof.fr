import { Badge } from 'react-bootstrap';

export function SessionStatusBadge({ session: { is_canceled, date_start, date_end }, ...props }) {
  const now = new Date();
  const dateStart = new Date(date_start),
    dateEnd = new Date(date_end);
  return is_canceled ? (
    <Badge bg="danger" {...props}>
      Annulée
    </Badge>
  ) : now.getTime() < dateStart.getTime() ? (
    <Badge bg="info" {...props}>
      À venir
    </Badge>
  ) : now.getTime() <= dateEnd.getTime() ? (
    <Badge bg="success" {...props}>
      En cours
    </Badge>
  ) : (
    <Badge bg="secondary" {...props}>
      Passée
    </Badge>
  );
}
