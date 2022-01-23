import { useRouter } from 'next/router';
import { BsXOctagon } from 'react-icons/bs';
import { postCancelSession } from '../lib/client/api';
import { ConfirmDialog } from './ConfirmDialog';
import { renderSessionName } from './table';

export function CancelSessionConfirmDialog({ session, triggerer }) {
  const router = useRouter();

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
        </>
      )}
      variant="danger"
      icon={BsXOctagon}
      action="Annuler la séance"
      triggerer={triggerer}
      confirmPromise={() => postCancelSession(session.id)}
      onSuccess={() => router.reload()}
    />
  );
}
