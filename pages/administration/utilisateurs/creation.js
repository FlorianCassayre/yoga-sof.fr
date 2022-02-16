import { BsPerson } from 'react-icons/bs';
import { UserForm } from '../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';
import { BREADCRUMB_USER_CREATE } from '../../../lib/client';

export default function AdminUserCreate() {

  return (
    <PrivateLayout>
      <ContentLayout title="Création d'un utilisateur" icon={BsPerson} breadcrumb={BREADCRUMB_USER_CREATE}>

        <UserForm />

      </ContentLayout>
    </PrivateLayout>
  );
}
