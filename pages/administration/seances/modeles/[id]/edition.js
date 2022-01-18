import { useRouter } from 'next/router';
import { breadcrumbForSessionModelEdit } from '../../../../../components';
import { SessionModelForm } from '../../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../../components/layout/admin';

export default function AdminSeance({ pathname }) {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout pathname={pathname}>
      <ContentLayout pathname={pathname} title="Modification modèle de séance" breadcrumb={breadcrumbForSessionModelEdit({ id })}>

        <SessionModelForm editRecordId={id} />

      </ContentLayout>
    </PrivateLayout>
  );
}

AdminSeance.getInitialProps = ({ pathname })  => {
  return { pathname };
}
