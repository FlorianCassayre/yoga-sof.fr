import { useState } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { BsXLg } from 'react-icons/bs';
import { usePromiseCallback } from '../hooks';
import { ErrorMessage } from './ErrorMessage';

export function ConfirmDialog({ triggerer, title, description, variant, icon: Icon, action, cancelAction, confirmPromise, onSuccess }) {
  const [show, setShow] = useState(false);
  const [{ isLoading, isError, data, error }, callback] = usePromiseCallback(() => confirmPromise().then(() => {
    setShow(false);
    onSuccess();
  }), []);

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
          {isError && (
            <ErrorMessage error={error} />
          )}
          {description}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" disabled={isLoading} onClick={() => setShow(false)}>
            <BsXLg className="icon me-2" />
            {cancelAction != null ? cancelAction : 'Annuler'}
          </Button>
          <Button variant={variant} disabled={isLoading} onClick={() => callback()}>
            <Icon className="icon me-2" />
            {action}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
