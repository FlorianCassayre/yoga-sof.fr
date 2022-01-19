import { useRouter } from 'next/router';
import { breadcrumbForSessionModelEdit } from '../../../../../components';
import { SessionModelForm } from '../../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../../components/layout/admin';

export default function AdminSeance({ pathname }) {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout pathname={pathname}>

        <SessionModelForm
          editRecordId={id}
          container={({ data, ...props }) => (
            <ContentLayout {...props} pathname={pathname} title="Modification d'un modèle de séance" breadcrumb={data && breadcrumbForSessionModelEdit(data)} />
          )}
        />

    </PrivateLayout>
  );
}

AdminSeance.getInitialProps = ({ pathname })  => {
  return { pathname };
}
