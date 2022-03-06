import { useRouter } from 'next/router';
import { Alert } from 'react-bootstrap';
import { BsExclamationTriangleFill, BsJournalText } from 'react-icons/bs';
import { CourseRegistrationCreateForm } from '../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';
import { BREADCRUMB_REGISTRATIONS_CREATE } from '../../../lib/client';

export default function AdminRegistrationCreate() {
  const router = useRouter();
  const { userId: userIdRaw, courseId: courseIdRaw } = router.query;

  const userId = parseInt(userIdRaw);
  const courseId = parseInt(courseIdRaw);

  return (
    <PrivateLayout>
      <ContentLayout title="Inscription d'un utilisateur à une séance" icon={BsJournalText} breadcrumb={BREADCRUMB_REGISTRATIONS_CREATE}>
        <Alert variant="warning">
          <BsExclamationTriangleFill className="icon me-2" />
          Attention, en principe les utilisateurs sont censés s'inscrire eux-mêmes aux séances. En remplissant ce formulaire vous prenez la main sur le compte de l'utilisateur.
        </Alert>

        <CourseRegistrationCreateForm
          redirect={obj => (obj != null ? `/administration/seances/planning/${obj.courseId}` : '/administration/inscriptions')}
          initialValues={{
            userId: Number.isNaN(userId) ? undefined : userId,
            courseId: Number.isNaN(courseId) ? undefined : courseId,
          }}
        />
      </ContentLayout>
    </PrivateLayout>
  );
}
