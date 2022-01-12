import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { BsXLg } from 'react-icons/bs';

export function ConfirmDialog({ triggerer, title, description, confirmButton }) {
  const [show, setShow] = useState(false);

  return (
    <>
      {triggerer(() => setShow(true))}

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {description}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            <BsXLg className="icon me-2" />
            Annuler
          </Button>
          {confirmButton}
        </Modal.Footer>
      </Modal>
    </>
  );
}
