import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { BsXOctagon } from 'react-icons/bs';
import { postCancelSession } from '../lib/client/api';
import { useRefreshContext } from '../state';
import { ConfirmDialog } from './ConfirmDialog';
import { renderSessionName } from './table';

export function CancelSessionConfirmDialog({ session, triggerer }) {
  const refresh = useRefreshContext();

  const [reason, setReason] = useState('');

  return (
    <ConfirmDialog
      title="Annuler la séance"
      description={(
        <>
          Souhaitez-vous réellement annuler cette séance ?
          <ul>
            <li>{renderSessionName(session)}</li>
          </ul>
          Les éventuelles personnes qui s'y sont inscrites seront notifiées.
          <br />
          Vous pouvez optionnellement indiquer un motif (qui sera également transmis aux personnes inscrites) :
          <Form.Control
            as="textarea"
            placeholder="Motif..."
            style={{ height: '100px' }}
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </>
      )}
      variant="danger"
      icon={BsXOctagon}
      action="Annuler la séance"
      triggerer={triggerer}
      confirmPromise={() => postCancelSession(session.id, { cancelation_reason: reason && reason.trim() ? reason.trim() : undefined })}
      onSuccess={refresh}
    />
  );
}
