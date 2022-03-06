import { Badge } from 'react-bootstrap';

export function CourseStatusBadge({ course: { isCanceled, dateStart: dateStartRaw, dateEnd: dateEndRaw }, ...props }) {
  const now = new Date();
  const dateStart = new Date(dateStartRaw), dateEnd = new Date(dateEndRaw);
  return isCanceled ? (
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
