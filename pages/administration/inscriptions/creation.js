import { useRouter } from 'next/router';
import { Alert } from 'react-bootstrap';
import { BsExclamationTriangleFill, BsJournalText } from 'react-icons/bs';
import { RegistrationCreateForm } from '../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';
import { BREADCRUMB_REGISTRATIONS_CREATE } from '../../../lib/client';

export default function AdminRegistrationCreate() {
  const router = useRouter();
  const { user_id, session_id } = router.query;

  const userId = parseInt(user_id), sessionId = parseInt(session_id);

  return (
    <PrivateLayout>
      <ContentLayout title="Inscription d'un utilisateur à une séance" icon={BsJournalText} breadcrumb={BREADCRUMB_REGISTRATIONS_CREATE}>

        <Alert variant="warning">
          <BsExclamationTriangleFill className="icon me-2" />
          Attention, en principe les utilisateurs sont censés s'inscrire eux-mêmes aux séances.
          En remplissant ce formulaire vous prenez la main sur le compte de l'utilisateur.
        </Alert>

        <RegistrationCreateForm
          redirect={obj => obj != null ? `/administration/seances/planning/${obj.session_id}` : '/administration/inscriptions'}
          initialValues={{
            user_id: isNaN(userId) ? undefined : userId,
            session_id: isNaN(sessionId) ? undefined : sessionId,
          }}
        />

      </ContentLayout>
    </PrivateLayout>
  );
}
