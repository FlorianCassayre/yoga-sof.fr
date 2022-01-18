import { useRouter } from 'next/router';
import { breadcrumbForSessionPlanningEdit } from '../../../../../components';
import { SessionForm } from '../../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../../components/layout/admin';

export default function AdminSeancePlanningEdit({ pathname }) {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout pathname={pathname}>
      <ContentLayout pathname={pathname} title="Modification d'une séance planifiée" breadcrumb={breadcrumbForSessionPlanningEdit({ id })}>

        <SessionForm editRecordId={id} />

      </ContentLayout>
    </PrivateLayout>
  );
}

AdminSeancePlanningEdit.getInitialProps = ({ pathname })  => {
  return { pathname };
}
