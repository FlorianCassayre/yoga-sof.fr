import { useRouter } from 'next/router';
import { BsCalendar } from 'react-icons/bs';
import { SessionModelForm } from '../../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../../components/layout/admin';
import { breadcrumbForSessionModelEdit } from '../../../../../lib/client';

export default function AdminSeance() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout>
      <SessionModelForm
        editRecordId={id}
        // eslint-disable-next-line react/no-unstable-nested-components
        container={({ data, ...props }) => <ContentLayout {...props} title="Modification d'un modèle de séance" icon={BsCalendar} breadcrumb={data && breadcrumbForSessionModelEdit(data)} />}
      />
    </PrivateLayout>
  );
}
