import { useRouter } from 'next/router';
import { BsCollection } from 'react-icons/bs';
import { CourseBundleForm } from '../../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../../components/layout/admin';
import { breadcrumbForBundleEdit } from '../../../../../lib/client';

export default function CourseBundleEdit() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout>
      <CourseBundleForm
        editRecordId={id}
        // eslint-disable-next-line react/no-unstable-nested-components
        container={({ data, ...props }) => <ContentLayout {...props} title="Modification d'un lot de séances" icon={BsCollection} breadcrumb={data && breadcrumbForBundleEdit(data)} />}
      />
    </PrivateLayout>
  );
}
