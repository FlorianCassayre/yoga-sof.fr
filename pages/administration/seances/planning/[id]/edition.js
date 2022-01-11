import { useRouter } from 'next/router';
import { breadcrumbForSessionPlanningIdEdit } from '../../../../../components';
import { SessionForm } from '../../../../../components/form';
import { PrivateLayout } from '../../../../../components/layout/admin';

export default function AdminSeancePlanningEdit({ pathname }) {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout pathname={pathname} title="Modification d'une séance planifiée" breadcrumb={breadcrumbForSessionPlanningIdEdit(id)}>

      <SessionForm editRecordId={id} />

    </PrivateLayout>
  );
}

AdminSeancePlanningEdit.getInitialProps = ({ pathname })  => {
  return { pathname };
}
