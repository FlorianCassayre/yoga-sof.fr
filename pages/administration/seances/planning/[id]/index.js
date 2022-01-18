import { useRouter } from 'next/router';
import { breadcrumbForSessionPlanningId, breadcrumbForSessionPlanningIdEdit } from '../../../../../components';
import { PrivateLayout } from '../../../../../components/layout/admin';

export default function SessionView({ pathname }) {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout pathname={pathname} title="Séance" breadcrumb={breadcrumbForSessionPlanningId(id)}>



    </PrivateLayout>
  );
}

SessionView.getInitialProps = ({ pathname })  => {
  return { pathname };
}
