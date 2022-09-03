import { BsXOctagon } from 'react-icons/bs';
import { postCancelCourseRegistration } from '../lib/client/api';
import { useNotificationsContext, useRefreshContext } from '../state';
import { ConfirmDialog } from './ConfirmDialog';
import { displayCourseName, displayUserName } from '../lib/common';

export function CancelRegistrationConfirmDialog({ registration, triggerer }) {
  const refresh = useRefreshContext();
  const { notify } = useNotificationsContext();

  const { id, user, course } = registration;

  return (
    <ConfirmDialog
      title="Désinscrire un utilisateur d'une séance"
      description={(
        <>
          Souhaitez-vous réellement désinscrire l'utilisateur de cette séance ?
          <ul>
            <li>{displayUserName(user)}</li>
            <li>{displayCourseName(course)}</li>
          </ul>
        </>
      )}
      variant="danger"
      icon={BsXOctagon}
      action="Confirmer la désinscription"
      triggerer={triggerer}
      confirmPromise={() => postCancelCourseRegistration(id)}
      onSuccess={() => {
        notify({
          title: 'Désinscription réussie',
          body: `L'utilisateur ${displayUserName(user)} a été désinscrit de la ${displayCourseName(course, false)}.`,
          icon: BsXOctagon,
          delay: 10,
        });

        refresh();
      }}
    />
  );
}
