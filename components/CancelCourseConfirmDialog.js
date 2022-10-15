import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { BsXOctagon } from 'react-icons/bs';
import { postCancelCourse } from '../lib/client/api';
import { useNotificationsContext, useRefreshContext } from './state';
import { ConfirmDialog } from './ConfirmDialog';
import { displayCourseName } from '../lib/common';

export function CancelCourseConfirmDialog({ course, triggerer }) {
  const refresh = useRefreshContext();
  const { notify } = useNotificationsContext();

  const [reason, setReason] = useState('');

  return (
    <ConfirmDialog
      title="Annuler la séance"
      description={(
        <>
          Souhaitez-vous réellement annuler cette séance ?
          <ul>
            <li>{displayCourseName(course)}</li>
          </ul>
          Les éventuelles personnes qui s'y sont inscrites seront notifiées.
          <br />
          Vous pouvez optionnellement indiquer un motif (qui sera également transmis aux personnes inscrites) :
          <Form.Control as="textarea" placeholder="Motif..." style={{ height: '100px' }} value={reason} onChange={e => setReason(e.target.value)} />
        </>
      )}
      variant="danger"
      icon={BsXOctagon}
      action="Annuler la séance"
      triggerer={triggerer}
      confirmPromise={() => postCancelCourse(course.id, { cancelationReason: reason && reason.trim() ? reason.trim() : undefined })}
      onSuccess={() => {
        notify({
          title: 'Annulation réussie',
          body: `La ${displayCourseName(course, false)} a été annulée.`,
          icon: BsXOctagon,
          delay: 10,
        });

        refresh();
      }}
    />
  );
}
