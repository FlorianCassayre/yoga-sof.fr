import { BsXOctagon } from 'react-icons/bs';
import { postCancelRegistration } from '../lib/client/api';
import { useNotificationsContext, useRefreshContext } from '../state';
import { ConfirmDialog } from './ConfirmDialog';
import { displaySessionName } from '../lib/common';

export function CancelRegistrationConfirmDialog({ registration, triggerer }) {
  const refresh = useRefreshContext();
  const { notify } = useNotificationsContext();

  const { id, user, session } = registration;

  return (
    <ConfirmDialog
      title="Désinscrire un utilisateur d'une séance"
      description={(
        <>
          Souhaitez-vous réellement désinscrire l'utilisateur de cette séance ?
          <ul>
            <li>{user.name}</li>
            <li>{displaySessionName(session)}</li>
          </ul>
        </>
      )}
      variant="danger"
      icon={BsXOctagon}
      action="Confirmer la désinscription"
      triggerer={triggerer}
      confirmPromise={() => postCancelRegistration(id)}
      onSuccess={() => {
        notify({
          title: 'Désinscription réussie',
          body: `L'utilisateur ${user.name} a été désinscrit de la ${displaySessionName(session, false)}.`,
          icon: BsXOctagon,
          delay: 10,
        });

        refresh();
      }}
    />
  );
}
