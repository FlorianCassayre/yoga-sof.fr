import { useRouter } from 'next/router';
import { BREADCRUMB_SESSIONS, breadcrumbForSessionModelIdEdit } from '../../../../../components';
import { SessionModelForm } from '../../../../../components/form';
import { PrivateLayout } from '../../../../../components/layout/admin';

export default function AdminSeance({ pathname }) {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout pathname={pathname} title="Modification modèle de séance" breadcrumb={breadcrumbForSessionModelIdEdit(id)}>

      <SessionModelForm editRecordId={id} />

    </PrivateLayout>
  );
}

AdminSeance.getInitialProps = ({ pathname })  => {
  return { pathname };
}
