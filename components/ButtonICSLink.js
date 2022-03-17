import React from 'react';
import { Button, Form, InputGroup, OverlayTrigger, Popover } from 'react-bootstrap';
import { BsCalendar, BsClipboard } from 'react-icons/bs';

export function ButtonICSLink({ session, coach }) {
  const url = `${window.location.origin}/api/calendar.ics?token=${session.publicAccessToken}${coach ? '&coach' : ''}`;
  const inputId = 'input-popover-copy-link';
  const selectInput = () => {
    const input = document.getElementById(inputId);
    input.select();
  };
  const buttonClickHandler = () => {
    selectInput();
    document.execCommand('copy');
  };
  const inputClickHandler = () => selectInput();
  return (
    <OverlayTrigger
      trigger="click"
      placement="top"
      rootClose
      overlay={(
        <Popover id="popover-copy-link">
          <Popover.Header as="h3">
            Lien vers mon agenda
            {coach && ` d'enseignant`}
          </Popover.Header>
          <Popover.Body className="pb-2">
            <Form.Group>
              <InputGroup>
                <Form.Control id={inputId} value={url} readOnly onClick={inputClickHandler} />
                <Button variant="outline-secondary" onClick={buttonClickHandler}>
                  <BsClipboard className="icon" />
                </Button>
              </InputGroup>
            </Form.Group>
            <div className="mt-2">
              Ajoutez ce lien dans votre calendrier.
            </div>
          </Popover.Body>
        </Popover>
      )}
    >
      <Button variant="secondary" className="mb-2">
        <BsCalendar className="icon me-2" />
        Exporter l'agenda
        {coach && ` d'enseignant`}
      </Button>
    </OverlayTrigger>
  );
}
