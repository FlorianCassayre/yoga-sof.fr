import { useState } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { BsXLg } from 'react-icons/bs';
import { ErrorMessage } from './ErrorMessage';
import { isErrorCode } from './http';

export function ConfirmDialog({ triggerer, title, description, variant, icon: Icon, action, confirmPromise, onSuccess }) {
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    setError(null);

    confirmPromise()
      .then(response => {
        if(isErrorCode(response.status)) {
          return response.json().then(json => {
            throw new Error(json.error);
          });
        }
        return response.json();
      })
      .then(() => {
        // Close and reset
        setLoading(false);
        setShow(false);
        setError(null);
        onSuccess();
      })
      .catch(error => {
        setLoading(false);
        setError(error);
      });
  };

  return (
    <>
      {triggerer(() => setShow(true))}

      <Modal show={show} onHide={() => !isLoading && setShow(false)}>
        <Modal.Header closeButton={!isLoading}>
          <Modal.Title>
            {title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoading && (
            <div className="my-2 text-center">
              <Spinner animation="border" />
            </div>
          )}
          {error && (
            <ErrorMessage error={error} />
          )}
          {description}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" disabled={isLoading} onClick={() => setShow(false)}>
            <BsXLg className="icon me-2" />
            Annuler
          </Button>
          <Button variant={variant} disabled={isLoading} onClick={handleConfirm}>
            <Icon className="icon me-2" />
            {action}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
