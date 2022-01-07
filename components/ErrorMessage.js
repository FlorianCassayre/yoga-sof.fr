import { Alert } from 'react-bootstrap';
import { BsExclamationTriangleFill } from 'react-icons/bs';

export function ErrorMessage({ children = 'Une erreur est survenue.', error }) {
  // TODO show error in collapse mode
  return (
    <Alert variant="danger">
      <BsExclamationTriangleFill className="icon me-2" />
      {children}
    </Alert>
  );
}
