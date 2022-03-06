import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { BsExclamationTriangleFill } from 'react-icons/bs';

export function ErrorMessage({ children = 'Une erreur est survenue.', error, noMargin = false }) {
  const [isCollapsed, setCollapsed] = useState(true);

  const handleClick = e => {
    e.preventDefault();
    setCollapsed(false);
  };

  return (
    <Alert variant="danger" className={noMargin ? 'mb-0' : null}>
      <BsExclamationTriangleFill className="icon me-2" />
      {children}
      {error
        && (isCollapsed ? (
          <>
            {' '}
            <Alert.Link href="#" onClick={handleClick}>
              L'afficher ?
            </Alert.Link>
          </>
        ) : (
          <>
            <br />
            <div className="font-monospace" style={{ whiteSpace: 'pre-wrap' }}>
              {error.message}
              {' '}
              {/* .stack might be useful too */}
            </div>
          </>
        ))}
    </Alert>
  );
}
