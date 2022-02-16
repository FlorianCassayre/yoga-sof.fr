import { BsXOctagon } from 'react-icons/bs';
import { postCancelRegistration } from '../lib/client/api';
import { useRefreshContext } from '../state';
import { ConfirmDialog } from './ConfirmDialog';
import { renderSessionName } from './table';

export function CancelRegistrationConfirmDialog({ registration, triggerer }) {
  const refresh = useRefreshContext();

  const { id, user, session } = registration;

  return (
    <ConfirmDialog
      title="Désinscrire un utilisateur d'une séance"
      description={(
        <>
          Souhaitez-vous réellement désinscrire l'utilisateur de cette séance ?
          <ul>
            <li>{user.name}</li>
            <li>{renderSessionName(session)}</li>
          </ul>
        </>
      )}
      variant="danger"
      icon={BsXOctagon}
      action="Confirmer la désinscription"
      triggerer={triggerer}
      confirmPromise={() => postCancelRegistration(id)}
      onSuccess={refresh}
    />
  );
}
