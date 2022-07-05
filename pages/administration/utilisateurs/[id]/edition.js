import { useRouter } from 'next/router';
import { BsPerson } from 'react-icons/bs';
import { UserForm } from '../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../components/layout/admin';
import { breadcrumbForUserEdit } from '../../../../lib/client';

export default function UserEdit() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout>
      <UserForm
        editRecordId={id}
        // eslint-disable-next-line react/no-unstable-nested-components
        container={({ data, ...props }) => <ContentLayout {...props} title="Modification d'un utilisateur" icon={BsPerson} breadcrumb={data && breadcrumbForUserEdit(data)} />}
      />
    </PrivateLayout>
  );
}
